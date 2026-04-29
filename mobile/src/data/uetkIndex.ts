import uetkLakes from './uetk-lakes.geojson.json';
import uetkRivers from './uetk-rivers.geojson.json';

export interface UetkRecord {
  id: string;
  name: string;
  kind: 'lake' | 'reservoir' | 'lagoon' | 'pond' | 'river';
  lng: number;
  lat: number;
  area?: number | null;  // area_ha for lakes, length_km for rivers
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
  const out: { rec: UetkRecord; norm: string }[] = [];
  const fcs = [uetkLakes, uetkRivers] as unknown as GeoJSON.FeatureCollection[];
  for (const fc of fcs) {
    for (const f of fc.features) {
      const p = f.properties as
        | { id?: string; name?: string; kind?: string; lng?: number; lat?: number; area_ha?: number; length_km?: number }
        | null;
      if (!p?.id || !p.name) continue;
      const kind = (['lake', 'reservoir', 'lagoon', 'pond', 'river'] as const).includes(
        p.kind as 'lake',
      )
        ? (p.kind as UetkRecord['kind'])
        : 'lake';
      out.push({
        rec: {
          id: p.id,
          name: p.name,
          kind,
          lng: typeof p.lng === 'number' ? p.lng : 0,
          lat: typeof p.lat === 'number' ? p.lat : 0,
          area: typeof p.area_ha === 'number' ? p.area_ha : typeof p.length_km === 'number' ? p.length_km : null,
        },
        norm: normalize(p.name),
      });
    }
  }
  _index = out;
  return out;
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
  return [...prefix, ...middle].slice(0, limit);
}
