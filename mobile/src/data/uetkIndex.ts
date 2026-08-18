import uetkLakes from './uetk-lakes.geojson.json';
import uetkRivers from './uetk-rivers.geojson.json';

export interface UetkRecord {
  id: string;
  name: string;
  kind: 'lake' | 'reservoir' | 'lagoon' | 'pond' | 'river';
  lng: number;
  lat: number;
  area?: number | null;  // area_ha for lakes, length_km for rivers
  avgDepthM?: number | null;
  maxDepthM?: number | null;
  shorelineKm?: number | null;
}

// Strip Lithuanian diacritics so a search for "Kursiu" still finds "Kuršių".
function normalize(s: string): string {
  return s
    .toLowerCase()
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '');
}

let _index: { rec: UetkRecord; norm: string }[] | null = null;

function buildIndex(): { rec: UetkRecord; norm: string }[] {
  if (_index) return _index;

  // key = normalizedName + kind → keep only the largest (longest river / biggest lake)
  const best = new Map<string, UetkRecord>();

  const fcs = [uetkLakes, uetkRivers] as unknown as GeoJSON.FeatureCollection[];
  for (const fc of fcs) {
    for (const f of fc.features) {
      const p = f.properties as
        | { id?: string; name?: string; kind?: string; lng?: number; lat?: number; area_ha?: number; length_km?: number; avg_depth_m?: number; max_depth_m?: number; shoreline_km?: number }
        | null;
      if (!p?.id || !p.name) continue;
      const kind = (['lake', 'reservoir', 'lagoon', 'pond', 'river'] as const).includes(
        p.kind as 'lake',
      )
        ? (p.kind as UetkRecord['kind'])
        : 'lake';
      const area = typeof p.area_ha === 'number' ? p.area_ha : typeof p.length_km === 'number' ? p.length_km : 0;
      const rec: UetkRecord = {
        id: p.id,
        name: p.name,
        kind,
        lng: typeof p.lng === 'number' ? p.lng : 0,
        lat: typeof p.lat === 'number' ? p.lat : 0,
        area: area || null,
        avgDepthM: typeof p.avg_depth_m === 'number' ? p.avg_depth_m : null,
        maxDepthM: typeof p.max_depth_m === 'number' ? p.max_depth_m : null,
        shorelineKm: typeof p.shoreline_km === 'number' ? p.shoreline_km : null,
      };
      // For rivers: deduplicate same-name entries, keep the longest segment.
      // Lakes with the same name are genuinely different bodies, keep all.
      if (kind === 'river') {
        const key = normalize(p.name);
        const existing = best.get(key);
        if (!existing || area > (existing.area ?? 0)) best.set(key, rec);
      } else {
        best.set(p.id, rec);
      }
    }
  }

  _index = [...best.values()].map(rec => ({ rec, norm: normalize(rec.name) }));
  return _index;
}

// Returns up to `limit` UETK records whose normalized name contains the
// normalized query. Prefix matches rank above middle/end matches.
export function searchUetk(query: string, limit = 8): UetkRecord[] {
  const q = normalize(query.trim());
  if (q.length < 2) return [];
  const idx = buildIndex();
  const prefix: UetkRecord[] = [];
  const middle: UetkRecord[] = [];
  for (const { rec, norm } of idx) {
    const at = norm.indexOf(q);
    if (at < 0) continue;
    if (at === 0) prefix.push(rec);
    else middle.push(rec);
    if (prefix.length >= limit) break;
  }
  const seen = new Set<string>();
  return [...prefix, ...middle]
    .filter(r => !seen.has(r.id) && (seen.add(r.id), true))
    .slice(0, limit);
}
