"""
Extracts per-lake bathymetric data from Batimetrija.gdb.

  z  — cumulative depth polygons (shallowest first, nested filled shapes)
       tolerance = lake_size/400 → smooth curves
  p  — depth label points (centroid of longest Countours_L segment per depth)
       compact: [[depth, lng, lat], ...]
"""

import fiona, json, os
from shapely.geometry import shape, Point
from shapely.ops import unary_union
from shapely.prepared import prep
from pyproj import Transformer

GDB   = r'C:\Users\ITwork\dev\fishingapp\Batimetrija.gdb'
LAKES = r'C:\Users\ITwork\dev\fishingapp\mobile\src\data\uetk-lakes.geojson.json'
OUT   = r'C:\Users\ITwork\dev\fishingapp\mobile\src\data\bathymetry.json'

lks94_to_wgs84 = Transformer.from_crs('EPSG:3346', 'EPSG:4326', always_xy=True)
wgs84_to_lks94 = Transformer.from_crs('EPSG:4326', 'EPSG:3346', always_xy=True)


def convert_ring(coords):
    out, prev = [], None
    for x, y in coords:
        lng, lat = lks94_to_wgs84.transform(x, y)
        pt = [round(lng, 5), round(lat, 5)]
        if pt != prev:
            out.append(pt)
            prev = pt
    return out


def geom_to_compact(geom):
    if geom.geom_type == 'Polygon':
        rings = [convert_ring(list(geom.exterior.coords))]
        for hole in geom.interiors:
            rings.append(convert_ring(list(hole.coords)))
        return 'Polygon', rings
    if geom.geom_type == 'MultiPolygon':
        polys = []
        for poly in geom.geoms:
            if poly.is_empty:
                continue
            rings = [convert_ring(list(poly.exterior.coords))]
            for hole in poly.interiors:
                rings.append(convert_ring(list(hole.coords)))
            polys.append(rings)
        return 'MultiPolygon', polys
    return None, None


# ── 1. Load bathymetric lake polygons ─────────────────────────────────────────
print('Loading bathymetric lakes...')
bati_lakes = []
with fiona.open(GDB, layer='Lakes') as src:
    for feat in src:
        geom = shape(feat['geometry'])
        bati_lakes.append({
            'idx': len(bati_lakes),
            'geom': geom,
            'prepared': prep(geom),
            'bounds': geom.bounds,
            'bands': {},
        })
print(f'  {len(bati_lakes)} lakes')

# ── 2. Assign depth band polygons to lakes ────────────────────────────────────
print('Assigning depth bands (Countours_P)...')
with fiona.open(GDB, layer='Countours_P') as src:
    for feat in src:
        if (feat['properties']['TIPAS'] or '') == 'Sala':
            continue
        gylis = feat['properties']['GYLIS']
        if gylis is None:
            continue
        gylis = float(gylis)
        geom = shape(feat['geometry'])
        cx, cy = geom.centroid.x, geom.centroid.y
        for lake in bati_lakes:
            bx1, by1, bx2, by2 = lake['bounds']
            if bx1 <= cx <= bx2 and by1 <= cy <= by2:
                if lake['prepared'].contains(geom.centroid):
                    lake['bands'].setdefault(gylis, []).append(geom)
                    break

# ── 3. Collect contour lines per lake (for depth labels) ──────────────────────
print('Collecting contour lines (Countours_L)...')
# label_lines[lake_idx][depth] = longest line geometry for that depth level
label_lines = [{} for _ in bati_lakes]

with fiona.open(GDB, layer='Countours_L') as src:
    for feat in src:
        gylis = feat['properties']['GYLIS']
        if gylis is None:
            continue
        gylis = float(gylis)
        if gylis <= 0:
            continue
        geom = shape(feat['geometry'])
        cx, cy = geom.centroid.x, geom.centroid.y
        for lake in bati_lakes:
            if not lake['bands']:
                continue
            bx1, by1, bx2, by2 = lake['bounds']
            if bx1 <= cx <= bx2 and by1 <= cy <= by2:
                if lake['prepared'].contains(geom.centroid):
                    existing = label_lines[lake['idx']].get(gylis)
                    if existing is None or geom.length > existing.length:
                        label_lines[lake['idx']][gylis] = geom
                    break

# ── 4. Match UETK kadastro IDs ────────────────────────────────────────────────
print('Matching UETK kadastro IDs...')
with open(LAKES, 'r', encoding='utf-8') as f:
    uetk_data = json.load(f)

uetk_pts = []
for feat in uetk_data['features']:
    p = feat['properties']
    if p.get('id') and p.get('lng') and p.get('lat'):
        x, y = wgs84_to_lks94.transform(p['lng'], p['lat'])
        uetk_pts.append({'id': p['id'], 'pt': Point(x, y)})

# ── 5. Build cumulative zones + depth label points ────────────────────────────
print('Building cumulative polygons + label points...')
result = {}

for lake in bati_lakes:
    if not lake['bands']:
        continue

    kadastro_id = None
    for up in uetk_pts:
        bx1, by1, bx2, by2 = lake['bounds']
        if bx1 <= up['pt'].x <= bx2 and by1 <= up['pt'].y <= by2:
            if lake['prepared'].contains(up['pt']):
                kadastro_id = up['id']
                break
    if not kadastro_id:
        continue

    minx, miny, maxx, maxy = lake['bounds']
    tol = max(maxx - minx, maxy - miny) / 800  # finer → smoother curves

    w, s = lks94_to_wgs84.transform(minx, miny)
    e, n = lks94_to_wgs84.transform(maxx, maxy)
    bbox = [round(w, 5), round(s, 5), round(e, 5), round(n, 5)]

    depths_sorted = sorted(lake['bands'].keys())
    max_depth = depths_sorted[-1]

    # Build cumulative polygons from deepest inward, shallowest first in output
    cumulative_from_deep = None
    cumulative_zones = []
    for depth in reversed(depths_sorted):
        band_union = unary_union(lake['bands'][depth])
        cumulative_from_deep = (
            band_union if cumulative_from_deep is None
            else unary_union([cumulative_from_deep, band_union])
        )
        cumulative_zones.append((depth, cumulative_from_deep))
    cumulative_zones.reverse()  # shallowest first

    zones_out = []
    for depth, cum_geom in cumulative_zones:
        simplified = cum_geom.simplify(tol, preserve_topology=True)
        if simplified.is_empty:
            continue
        gtype, coords = geom_to_compact(simplified)
        if gtype and coords:
            zones_out.append([depth, gtype, coords])

    if not zones_out:
        continue

    # Depth label points: centroid of longest Countours_L line per depth level
    # Skip the shallowest level (too close to shore, cluttered)
    label_pts = []
    for depth, line_geom in label_lines[lake['idx']].items():
        if depth <= 0:
            continue
        cx, cy = line_geom.centroid.x, line_geom.centroid.y
        lng, lat = lks94_to_wgs84.transform(cx, cy)
        label_pts.append([depth, round(lng, 5), round(lat, 5)])
    label_pts.sort(key=lambda x: x[0])

    result[kadastro_id] = {
        'b': bbox,
        'm': max_depth,
        'z': zones_out,
        'p': label_pts,
    }

print(f'  Built {len(result)} lake depth maps')

with open(OUT, 'w', encoding='utf-8') as f:
    json.dump(result, f, ensure_ascii=False, separators=(',', ':'))

size_kb = os.path.getsize(OUT) / 1024
print(f'Written {OUT}  ({size_kb:.0f} KB)')
