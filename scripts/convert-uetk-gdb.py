"""
Convert UETK.gdb to the GeoJSON format expected by the app.
Outputs: mobile/src/data/uetk-lakes.geojson.json
         mobile/src/data/uetk-rivers.geojson.json
"""
import json, sys
sys.stdout.reconfigure(encoding='utf-8')

import fiona
from shapely.geometry import shape, mapping
from shapely.ops import transform
from pyproj import Transformer

GDB_PATH = r'C:/Users/ITwork/dev/fishingapp/info_map/updated_uetk/UETK.gdb'
OUT_LAKES = r'C:/Users/ITwork/dev/fishingapp/mobile/src/data/uetk-lakes.geojson.json'
OUT_RIVERS = r'C:/Users/ITwork/dev/fishingapp/mobile/src/data/uetk-rivers.geojson.json'

# LKS94 (EPSG:3346) → WGS84 (EPSG:4326)
transformer = Transformer.from_crs("EPSG:3346", "EPSG:4326", always_xy=True)

def to_wgs84(geom):
    return transform(transformer.transform, geom)

def round_coords(obj, precision=5):
    if isinstance(obj, (int, float)):
        return round(obj, precision)
    if isinstance(obj, (list, tuple)):
        return [round_coords(x, precision) for x in obj]
    return obj

# kategorija → kind mapping
LAKE_KIND = {
    3: 'lake',
    4: 'reservoir',
    5: 'reservoir',
    6: 'pond',
    7: 'lagoon',
    # 9 = Baltijos jūra — skip
}

def convert_lakes():
    features = []
    skipped = 0
    with fiona.open(GDB_PATH, layer='ezerai_tvenkiniai') as src:
        total = len(src)
        for i, f in enumerate(src):
            if i % 500 == 0:
                print(f'  lakes {i}/{total}...')
            p = f['properties']
            kat = p.get('kategorija')
            kind = LAKE_KIND.get(kat)
            if kind is None:
                skipped += 1
                continue
            name = (p.get('pavadinimas') or '').strip()
            kad_id = str(p.get('kadastro_id') or '').strip()
            if not kad_id:
                skipped += 1
                continue

            try:
                geom_wgs = to_wgs84(shape(f['geometry']))
                geom_wgs = geom_wgs.simplify(0.0001, preserve_topology=True)
            except Exception:
                skipped += 1
                continue

            centroid = geom_wgs.centroid
            coords = round_coords(mapping(geom_wgs)['coordinates'])
            area_ha = p.get('SHAPE_Area')
            if area_ha:
                area_ha = round(area_ha / 10000, 1)  # m² → ha

            features.append({
                'type': 'Feature',
                'id': kad_id,
                'geometry': {'type': mapping(geom_wgs)['type'], 'coordinates': coords},
                'properties': {
                    'id': kad_id,
                    'name': name,
                    'kind': kind,
                    'lng': round(centroid.x, 5),
                    'lat': round(centroid.y, 5),
                    'area_ha': area_ha,
                },
            })

    print(f'Lakes: {len(features)} converted, {skipped} skipped')
    with open(OUT_LAKES, 'w', encoding='utf-8') as f:
        json.dump({'type': 'FeatureCollection', 'features': features}, f,
                  ensure_ascii=False, separators=(',', ':'))
    print(f'Written to {OUT_LAKES}')

def convert_rivers():
    features = []
    skipped = 0
    with fiona.open(GDB_PATH, layer='upes') as src:
        total = len(src)
        for i, f in enumerate(src):
            if i % 1000 == 0:
                print(f'  rivers {i}/{total}...')
            p = f['properties']
            name = (p.get('pavadinimas') or '').strip()
            kad_id = str(p.get('kadastro_id') or '').strip()
            if not kad_id:
                skipped += 1
                continue

            try:
                geom_wgs = to_wgs84(shape(f['geometry']))
                geom_wgs = geom_wgs.simplify(0.0003, preserve_topology=True)
            except Exception:
                skipped += 1
                continue

            # Use midpoint of line as representative point
            mid = geom_wgs.interpolate(0.5, normalized=True)
            coords = round_coords(mapping(geom_wgs)['coordinates'])
            length_km = p.get('ilgis_uetk')
            if length_km:
                length_km = round(float(length_km), 2)

            features.append({
                'type': 'Feature',
                'id': kad_id,
                'geometry': {'type': mapping(geom_wgs)['type'], 'coordinates': coords},
                'properties': {
                    'id': kad_id,
                    'name': name,
                    'kind': 'river',
                    'lng': round(mid.x, 5),
                    'lat': round(mid.y, 5),
                    'length_km': length_km,
                },
            })

    print(f'Rivers: {len(features)} converted, {skipped} skipped')
    with open(OUT_RIVERS, 'w', encoding='utf-8') as f:
        json.dump({'type': 'FeatureCollection', 'features': features}, f,
                  ensure_ascii=False, separators=(',', ':'))
    print(f'Written to {OUT_RIVERS}')

if __name__ == '__main__':
    print('Converting lakes...')
    convert_lakes()
    print('Converting rivers...')
    convert_rivers()
    print('Done.')
