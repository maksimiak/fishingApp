"""
Reads Batimetrija.gdb, computes avg_depth_m, max_depth_m, shoreline_km for each
bathymetric lake, then matches to uetk-lakes.geojson.json and patches the properties.

Matching strategy:
  1. Spatial: if UETK centroid (lat/lng → LKS94) falls inside a Batimetrija polygon → match
  2. Name fallback: normalized name match (handles edge cases where centroid is slightly off)
"""

import fiona
import json
import unicodedata
import re
from shapely.geometry import shape, Point
from shapely.prepared import prep
from pyproj import Transformer

GDB = r'C:\Users\ITwork\dev\fishingapp\Batimetrija.gdb'
LAKES_IN  = r'C:\Users\ITwork\dev\fishingapp\mobile\src\data\uetk-lakes.geojson.json'
LAKES_OUT = LAKES_IN  # overwrite in-place


def norm(s: str) -> str:
    s = s.lower()
    s = re.sub(r'^(e[zž]\.?\s*|e\.?\s+)', '', s)          # strip leading "ež.", "ez.", "e. "
    s = re.sub(r'\s+(e[zž]\.?|ež\.|t\.?|tvenkini[sy])$', '', s)  # strip trailing suffixes
    s = unicodedata.normalize('NFD', s)
    s = ''.join(c for c in s if unicodedata.category(c) != 'Mn')  # strip diacritics
    return s.strip()


# ── 1. Load bathymetric lake polygons ────────────────────────────────────────
print('Loading bathymetric lake polygons...')
bati_lakes = []
with fiona.open(GDB, layer='Lakes') as src:
    for feat in src:
        geom = shape(feat['geometry'])
        props = feat['properties']
        bati_lakes.append({
            'idx': len(bati_lakes),
            'name': props['PAVADINIMAS'] or '',
            'shoreline_m': props['SHAPE_Length'],
            'geom': geom,
            'prepared': prep(geom),
            'bounds': geom.bounds,   # (minx, miny, maxx, maxy)
            'depths': [],
        })

print(f'  Loaded {len(bati_lakes)} bathymetric lakes')


# ── 2. Spatial-join depth points to lake polygons ────────────────────────────
print('Loading and assigning depth points...')
with fiona.open(GDB, layer='Depth_points') as src:
    for feat in src:
        depth = feat['properties']['GYLIS']
        if not depth or depth <= 0:
            continue
        coords = feat['geometry']['coordinates']
        x, y = coords[0], coords[1]
        pt = Point(x, y)
        for lake in bati_lakes:
            bx1, by1, bx2, by2 = lake['bounds']
            if bx1 <= x <= bx2 and by1 <= y <= by2:
                if lake['prepared'].contains(pt):
                    lake['depths'].append(depth)
                    break

assigned = sum(1 for l in bati_lakes if l['depths'])
print(f'  Depth points assigned to {assigned}/{len(bati_lakes)} lakes')


# ── 3. Compute lake stats ─────────────────────────────────────────────────────
lake_stats = {}  # norm_name → stats (for name fallback)
for lake in bati_lakes:
    depths = lake['depths']
    stats = {
        'avg_depth': round(sum(depths) / len(depths), 1) if depths else None,
        'max_depth': round(max(depths), 1) if depths else None,
        'shoreline_km': round(lake['shoreline_m'] / 1000, 2),
        'geom': lake['geom'],
        'raw_name': lake['name'],
    }
    bati_lakes[lake['idx']]['stats'] = stats
    key = norm(lake['name'])
    # Keep entry with most depth points if name collision
    if key not in lake_stats or len(depths) > len(lake_stats[key].get('depths', [])):
        lake_stats[key] = {**stats, 'depths': depths}


# ── 4. Load UETK GeoJSON and match ───────────────────────────────────────────
print('Matching UETK lakes...')
wgs84_to_lks94 = Transformer.from_crs('EPSG:4326', 'EPSG:3346', always_xy=True)

with open(LAKES_IN, 'r', encoding='utf-8') as f:
    data = json.load(f)

spatial_matches = 0
name_matches = 0
no_match = 0

for feat in data['features']:
    p = feat['properties']
    lng, lat = p.get('lng', 0), p.get('lat', 0)
    stats = None

    # Spatial match: convert centroid to LKS94 and check containment
    if lng and lat:
        x, y = wgs84_to_lks94.transform(lng, lat)
        pt = Point(x, y)
        for lake in bati_lakes:
            bx1, by1, bx2, by2 = lake['bounds']
            if bx1 <= x <= bx2 and by1 <= y <= by2:
                if lake['prepared'].contains(pt):
                    stats = lake['stats']
                    spatial_matches += 1
                    break

    # Name fallback
    if stats is None:
        key = norm(p.get('name', ''))
        if key in lake_stats:
            stats = lake_stats[key]
            name_matches += 1
        else:
            no_match += 1

    if stats:
        if stats['avg_depth'] is not None:
            p['avg_depth_m'] = stats['avg_depth']
        if stats['max_depth'] is not None:
            p['max_depth_m'] = stats['max_depth']
        p['shoreline_km'] = stats['shoreline_km']


print(f'  Spatial matches : {spatial_matches}')
print(f'  Name fallback   : {name_matches}')
print(f'  No match        : {no_match}')
print(f'  Total enriched  : {spatial_matches + name_matches}')

# ── 5. Write output ───────────────────────────────────────────────────────────
with open(LAKES_OUT, 'w', encoding='utf-8') as f:
    json.dump(data, f, ensure_ascii=False, separators=(',', ':'))

print(f'Written to {LAKES_OUT}')

# ── 6. Spot-check: show enriched entries for famous lakes ─────────────────────
check = ['Galvė', 'Drūkšiai', 'Žuvintas', 'Neris', 'Dusynas', 'Vištytis']
print('\nSpot-check:')
for feat in data['features']:
    if feat['properties']['name'] in check:
        p = feat['properties']
        print(f"  {p['name']}: avg={p.get('avg_depth_m','—')} max={p.get('max_depth_m','—')} shore={p.get('shoreline_km','—')} km")
