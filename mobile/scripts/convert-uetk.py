"""Convert the UETK File Geodatabase to two minified GeoJSON files bundled with
the app. Produces:

  src/data/uetk-lakes.geojson.json   # MultiPolygon lakes / reservoirs / ponds
  src/data/uetk-rivers.geojson.json  # MultiLineString rivers

Source CRS is EPSG:3346 (LKS-94). Reprojected to EPSG:4326 (WGS84) for MapLibre.
Geometries are simplified with shapely (preserve_topology=True). The simplification
tolerance is in degrees; ~0.00005 deg ~= 5 m at Lithuanian latitudes.

Run from `mobile/`:
    python scripts/convert-uetk.py
"""
from __future__ import annotations

import json
import sys
from pathlib import Path

import pyogrio
import shapely
from shapely.geometry import mapping, box as shapely_box
from shapely.ops import transform as shp_transform
from pyproj import Transformer

LITHUANIA_CLIP = shapely_box(20.85, 53.85, 26.95, 56.55)

GDB_PATH = Path(__file__).resolve().parents[2] / "info_map" / "uetk.gdb"
OUT_DIR = Path(__file__).resolve().parents[1] / "src" / "data"
LAKES_OUT = OUT_DIR / "uetk-lakes.geojson.json"
RIVERS_OUT = OUT_DIR / "uetk-rivers.geojson.json"

# Tolerance in degrees (~5 m). Aggressive enough to keep file size manageable
# while preserving shape for tap detection and visual rendering at country zoom.
LAKE_TOLERANCE = 0.0001
RIVER_TOLERANCE = 0.001

# Drop tiny features whose smoothed geometry collapses or which are below the
# resolution we care about. Lakes smaller than 0.5 ha are noise on a phone screen.
MIN_LAKE_AREA_M2 = 5_000


def round_coords(geom_obj, ndigits: int = 5):
    """Round all numeric coordinates in a parsed GeoJSON geometry in place."""
    coords = geom_obj.get("coordinates")
    if coords is None:
        return geom_obj

    def _round(v):
        if isinstance(v, (int, float)):
            return round(v, ndigits)
        if isinstance(v, (list, tuple)):
            return [_round(x) for x in v]
        return v

    geom_obj["coordinates"] = _round(coords)
    return geom_obj


def classify_lake(kategorija: str | None) -> str:
    if not kategorija:
        return "lake"
    k = kategorija.lower()
    if "marios" in k:
        return "lagoon"
    if "patvenktas" in k or "tvenkinys" in k or "dirbtinis" in k:
        return "reservoir"
    return "lake"


def main() -> int:
    if not GDB_PATH.exists():
        print(f"ERR: GDB not found at {GDB_PATH}", file=sys.stderr)
        return 1

    OUT_DIR.mkdir(parents=True, exist_ok=True)

    transformer = Transformer.from_crs("EPSG:3346", "EPSG:4326", always_xy=True)
    project = transformer.transform

    # ---------- lakes ----------
    print("Reading lakes...", flush=True)
    lakes = pyogrio.read_dataframe(GDB_PATH, layer="ezerai_tvenkiniai")
    print(f"  {len(lakes)} rows", flush=True)

    lake_features = []
    for _, row in lakes.iterrows():
        geom = row.geometry
        if geom is None or geom.is_empty:
            continue
        area = float(row.get("st_area") or geom.area or 0)
        if area and area < MIN_LAKE_AREA_M2:
            continue
        # Reproject then simplify in WGS84 degrees.
        g = shp_transform(project, geom)
        g = g.simplify(LAKE_TOLERANCE, preserve_topology=True)
        if g.is_empty:
            continue
        rep = g.representative_point()
        geom_obj = round_coords(mapping(g), 5)
        lake_features.append(
            {
                "type": "Feature",
                "id": str(row["kadastro_id"]),
                "geometry": geom_obj,
                "properties": {
                    "id": str(row["kadastro_id"]),
                    "name": row["pavadinimas"] or "",
                    "kind": classify_lake(row["kategorija"]),
                    "lng": round(rep.x, 5),
                    "lat": round(rep.y, 5),
                    "area_ha": round(area / 10000, 1) if area else None,
                },
            }
        )
    print(f"  kept {len(lake_features)} lakes after filtering", flush=True)

    lakes_fc = {"type": "FeatureCollection", "features": lake_features}
    LAKES_OUT.write_text(
        json.dumps(lakes_fc, separators=(",", ":"), ensure_ascii=False),
        encoding="utf-8",
    )
    print(f"  wrote {LAKES_OUT} ({LAKES_OUT.stat().st_size / 1024:.0f} KB)", flush=True)

    # ---------- rivers ----------
    print("Reading rivers...", flush=True)
    rivers = pyogrio.read_dataframe(GDB_PATH, layer="upes_l")
    print(f"  {len(rivers)} rows", flush=True)

    river_features = []
    for _, row in rivers.iterrows():
        geom = row.geometry
        if geom is None or geom.is_empty:
            continue
        g = shp_transform(project, geom)
        g = g.intersection(LITHUANIA_CLIP)
        if g.is_empty:
            continue
        g = g.simplify(RIVER_TOLERANCE, preserve_topology=True)
        if g.is_empty:
            continue
        # Use first point as a stand-in centroid for camera flyTo.
        coords = list(g.coords) if g.geom_type == "LineString" else list(g.geoms[0].coords)
        midpoint = coords[len(coords) // 2]
        geom_obj = round_coords(mapping(g), 5)
        river_features.append(
            {
                "type": "Feature",
                "id": str(row["kadastro_id"]),
                "geometry": geom_obj,
                "properties": {
                    "id": str(row["kadastro_id"]),
                    "name": row["pavadinimas"] or "",
                    "kind": "river",
                    "lng": round(midpoint[0], 5),
                    "lat": round(midpoint[1], 5),
                    "length_km": (
                        round(float(row["ilgis_uetk"]), 2)
                        if row.get("ilgis_uetk") is not None
                        and not (
                            isinstance(row["ilgis_uetk"], float)
                            and (row["ilgis_uetk"] != row["ilgis_uetk"])  # NaN check
                        )
                        else None
                    ),
                },
            }
        )
    print(f"  kept {len(river_features)} rivers", flush=True)

    rivers_fc = {"type": "FeatureCollection", "features": river_features}
    RIVERS_OUT.write_text(
        json.dumps(rivers_fc, separators=(",", ":"), ensure_ascii=False),
        encoding="utf-8",
    )
    print(f"  wrote {RIVERS_OUT} ({RIVERS_OUT.stat().st_size / 1024:.0f} KB)", flush=True)

    print("Done.", flush=True)
    return 0


if __name__ == "__main__":
    sys.exit(main())
