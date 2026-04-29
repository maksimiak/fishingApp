// One-off script: looks up each of our 10 water bodies via Nominatim,
// fetches the OSM relation/way geometry via Overpass, and writes a single
// GeoJSON FeatureCollection to src/data/waterbodies.geojson.json.
// Run with: node scripts/fetch-waterbodies.mjs

import fs from 'node:fs/promises';
import path from 'node:path';
import osmtogeojson from 'osmtogeojson';
import simplify from '@turf/simplify';

// id matches our internal waterbodies.ts; queries are tried in order until one returns a hit.
// `overpass` is a raw Overpass query that runs first if present (used for tricky cases like the
// Neris river, where Nominatim returns the regional park instead of the watercourse).
const LOOKUPS = [
  { id: 'kaunas-res', kind: 'polygon', queries: ['Kauno marios, Lithuania', 'Kauno marios'] },
  { id: 'kursiu', kind: 'polygon', queries: ['Kuršių marios, Lithuania', 'Curonian Lagoon, Lithuania'] },
  { id: 'galve', kind: 'polygon', queries: ['Galvė, Trakai, Lithuania', 'Lake Galvė, Lithuania', 'Galvės ežeras'] },
  {
    id: 'plateliai',
    kind: 'polygon',
    overpass: `
[out:json][timeout:90];
area["ISO3166-1"="LT"][admin_level=2]->.lt;
(
  way["natural"="water"]["name"~"Platel"](area.lt);
  relation["natural"="water"]["name"~"Platel"](area.lt);
);
(._;>;);
out geom;
`.trim(),
    queries: [],
  },
  { id: 'drukshiai', kind: 'polygon', queries: ['Drūkšių ežeras, Lithuania', 'Lake Drūkšiai, Lithuania', 'Drūkšiai'] },
  { id: 'dusia', kind: 'polygon', queries: ['Dusios ežeras, Lithuania', 'Lake Dusia, Lithuania', 'Dusia'] },
  {
    id: 'siesikai',
    kind: 'polygon',
    overpass: `
[out:json][timeout:90];
area["ISO3166-1"="LT"][admin_level=2]->.lt;
(
  way["natural"="water"]["name"~"Siesik"](area.lt);
  relation["natural"="water"]["name"~"Siesik"](area.lt);
);
(._;>;);
out geom;
`.trim(),
    queries: [],
  },
  {
    id: 'rubikiai',
    kind: 'polygon',
    overpass: `
[out:json][timeout:90];
area["ISO3166-1"="LT"][admin_level=2]->.lt;
(
  way["natural"="water"]["name"~"Rubik"](area.lt);
  relation["natural"="water"]["name"~"Rubik"](area.lt);
);
(._;>;);
out geom;
`.trim(),
    queries: [],
  },
];

const NOMINATIM = 'https://nominatim.openstreetmap.org/search';
const OVERPASS = 'https://overpass-api.de/api/interpreter';
const UA = 'zvejoti-lt/1.0 (one-off geometry fetch; cjuseee@gmail.com)';

async function nominatimLookup(q) {
  const url = `${NOMINATIM}?q=${encodeURIComponent(q)}&format=json&polygon_geojson=1&limit=5&countrycodes=lt`;
  const resp = await fetch(url, { headers: { 'User-Agent': UA, Accept: 'application/json' } });
  if (!resp.ok) throw new Error(`Nominatim ${resp.status}: ${q}`);
  const arr = await resp.json();
  return arr;
}

async function overpassQuery(query) {
  for (let attempt = 0; attempt < 3; attempt++) {
    const resp = await fetch(OVERPASS, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'User-Agent': UA,
        Accept: 'application/json',
      },
      body: `data=${encodeURIComponent(query)}`,
    });
    if (resp.status === 429 || resp.status === 504) {
      const wait = (attempt + 1) * 15000;
      console.log(`    Overpass ${resp.status} — waiting ${wait / 1000}s before retry...`);
      await sleep(wait);
      continue;
    }
    if (!resp.ok) throw new Error(`Overpass ${resp.status}`);
    const json = await resp.json();
    return osmtogeojson(json);
  }
  throw new Error('Overpass 429 after retries');
}

async function overpassById(osmType, osmId) {
  const query = `[out:json][timeout:90];\n${osmType}(${osmId});\n(._;>;);\nout geom;`;
  return overpassQuery(query);
}

// Stitch all LineString features in a geojson into a single MultiLineString.
// Used when we get a relation made of many ways (e.g. a long river).
function mergeLines(geojson) {
  const lines = [];
  for (const f of geojson.features) {
    if (f.geometry?.type === 'LineString') lines.push(f.geometry.coordinates);
    else if (f.geometry?.type === 'MultiLineString') lines.push(...f.geometry.coordinates);
  }
  if (!lines.length) return null;
  return {
    type: 'Feature',
    geometry: { type: 'MultiLineString', coordinates: lines },
    properties: {},
  };
}

function pickBestFeature(geojson, lookup) {
  if (!geojson.features.length) return null;
  let best = null;
  for (const f of geojson.features) {
    const t = f.geometry?.type;
    if (lookup.kind === 'polygon' && !(t === 'Polygon' || t === 'MultiPolygon')) continue;
    if (lookup.kind === 'line' && !(t === 'LineString' || t === 'MultiLineString')) continue;
    if (!best) { best = f; continue; }
    const bestLen = JSON.stringify(best.geometry).length;
    const fLen = JSON.stringify(f.geometry).length;
    if (fLen > bestLen) best = f;
  }
  return best;
}

async function fetchOne(lookup) {
  // Path A: raw Overpass query — useful when Nominatim returns the wrong feature
  if (lookup.overpass) {
    console.log(`  · raw Overpass query`);
    try {
      const gj = await overpassQuery(lookup.overpass);
      let best;
      if (lookup.kind === 'line') {
        best = mergeLines(gj);
      } else {
        best = pickBestFeature(gj, lookup);
      }
      if (best) {
        best.id = lookup.id;
        if (!best.properties) best.properties = {};
        best.properties.waterbody_id = lookup.id;
        best.properties.kind = lookup.kind;
        const coordBytes = JSON.stringify(best.geometry.coordinates).length;
        console.log(`  ✓ ${lookup.id}: ${best.geometry.type}, ~${coordBytes} bytes coords`);
        return best;
      }
    } catch (e) {
      console.warn(`    Overpass error: ${e.message}`);
    }
  }
  for (const q of lookup.queries) {
    console.log(`  · trying "${q}"`);
    let hits;
    try {
      hits = await nominatimLookup(q);
    } catch (e) {
      console.warn(`    Nominatim error: ${e.message}`);
      continue;
    }
    if (!hits.length) continue;
    // Prefer relations, then ways
    hits.sort((a, b) => {
      const order = { relation: 0, way: 1, node: 2 };
      return (order[a.osm_type] ?? 9) - (order[b.osm_type] ?? 9);
    });
    for (const hit of hits) {
      if (hit.osm_type === 'node') continue;
      console.log(`    ↳ ${hit.osm_type}/${hit.osm_id} — ${hit.display_name?.slice(0, 60)}…`);
      await sleep(1100); // Nominatim/Overpass usage policy
      let gj;
      try {
        gj = await overpassById(hit.osm_type, hit.osm_id);
      } catch (e) {
        console.warn(`    Overpass error: ${e.message}`);
        continue;
      }
      const best = pickBestFeature(gj, lookup);
      if (best) {
        best.id = lookup.id;
        if (!best.properties) best.properties = {};
        best.properties.waterbody_id = lookup.id;
        best.properties.kind = lookup.kind;
        const coordBytes = JSON.stringify(best.geometry.coordinates).length;
        console.log(`  ✓ ${lookup.id}: ${best.geometry.type}, ~${coordBytes} bytes coords`);
        return best;
      }
    }
  }
  console.warn(`  ! no features for ${lookup.id}`);
  return null;
}

function sleep(ms) {
  return new Promise((r) => setTimeout(r, ms));
}

async function main() {
  const out = path.resolve('src/data/waterbodies.geojson.json');
  // Load any previously fetched features so we skip already-successful bodies.
  let existing = [];
  try {
    const raw = await fs.readFile(out, 'utf8');
    existing = JSON.parse(raw).features ?? [];
  } catch { /* first run or corrupt file — start fresh */ }
  const existingIds = new Set(existing.map((f) => f.properties?.waterbody_id));

  const features = [...existing];
  for (const lookup of LOOKUPS) {
    if (existingIds.has(lookup.id)) {
      console.log(`Skipping ${lookup.id} (already fetched)`);
      continue;
    }
    console.log(`Fetching ${lookup.id}…`);
    try {
      const feat = await fetchOne(lookup);
      if (feat) features.push(feat);
    } catch (e) {
      console.error(`  ✗ ${lookup.id}: ${e.message}`);
    }
    await sleep(3000);
  }

  // Simplify each feature with a small Douglas-Peucker tolerance (~30m at LT latitudes).
  // The map shows the whole country at ≤ zoom 9, so we don't need sub-meter precision.
  const tolerance = 0.0003; // degrees
  const simplified = features.map((f) => {
    try {
      const s = simplify(f, { tolerance, highQuality: false, mutate: false });
      return s;
    } catch (e) {
      console.warn(`  ! could not simplify ${f.properties?.waterbody_id}: ${e.message}`);
      return f;
    }
  });

  const fc = { type: 'FeatureCollection', features: simplified };
  await fs.writeFile(out, JSON.stringify(fc));
  const size = (await fs.stat(out)).size;
  console.log(`\nWrote ${simplified.length} features to ${out} (${(size / 1024).toFixed(1)} KB)`);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
