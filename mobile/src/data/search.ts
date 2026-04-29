import Constants from 'expo-constants';

const MAPTILER_KEY = (Constants.expoConfig?.extra as { maptilerKey?: string } | undefined)?.maptilerKey ?? '';

export interface RemoteWaterHit {
  id: string;
  name: string;
  lat: number;
  lng: number;
  type: 'lake' | 'river' | 'place';
  region?: string;
}

interface MapTilerFeature {
  id?: string | number;
  text?: string;
  place_name?: string;
  place_type?: string[];
  kind?: string;
  center?: [number, number];
  geometry?: { coordinates?: [number, number] };
  context?: { id?: string; text?: string }[];
  properties?: { kind?: string; class?: string; categories?: string[] };
}

const cache = new Map<string, RemoteWaterHit[]>();
let inflight: AbortController | null = null;

function classify(f: MapTilerFeature): 'lake' | 'river' | 'place' {
  const haystack = [
    f.kind,
    f.properties?.kind,
    f.properties?.class,
    ...(f.place_type ?? []),
    ...(f.properties?.categories ?? []),
  ]
    .filter((v): v is string => typeof v === 'string')
    .join(' ')
    .toLowerCase();
  if (/\b(river|stream|waterway|brook)\b/.test(haystack)) return 'river';
  if (/\b(lake|reservoir|lagoon|pond|water)\b/.test(haystack)) return 'lake';
  return 'place';
}

function pickRegion(f: MapTilerFeature): string | undefined {
  const ctx = f.context;
  if (!ctx?.length) return undefined;
  const region = ctx.find((c) => c.id?.startsWith('region') || c.id?.startsWith('subregion'));
  return region?.text;
}

// MapTiler's geocoding API doesn't expose a clean "water" type filter, so we
// query freely against Lithuania and post-filter by category keywords. Returns
// at most 8 results. Aborts in-flight calls when a new keystroke arrives.
export async function searchWaters(query: string): Promise<RemoteWaterHit[]> {
  const q = query.trim();
  if (q.length < 2) return [];
  const cached = cache.get(q.toLowerCase());
  if (cached) return cached;
  if (!MAPTILER_KEY) return [];

  inflight?.abort();
  const ctrl = new AbortController();
  inflight = ctrl;

  const url =
    `https://api.maptiler.com/geocoding/${encodeURIComponent(q)}.json` +
    `?key=${MAPTILER_KEY}&country=lt&language=lt&limit=10`;
  try {
    const res = await fetch(url, { signal: ctrl.signal });
    if (!res.ok) return [];
    const json = (await res.json()) as { features?: MapTilerFeature[] };
    const all = (json.features ?? []).map<RemoteWaterHit>((f) => {
      const center = f.center ?? f.geometry?.coordinates ?? [0, 0];
      return {
        id: `mt:${f.id ?? `${f.text ?? q}-${center[0]}-${center[1]}`}`,
        name: f.text ?? f.place_name ?? q,
        lat: center[1],
        lng: center[0],
        type: classify(f),
        region: pickRegion(f),
      };
    });
    // Prefer water hits but keep the rest as a fallback so the dropdown isn't
    // empty for a place name like "Trakai" that resolves to a town.
    const waterHits = all.filter((h) => h.type !== 'place');
    const merged = waterHits.length > 0 ? waterHits : all;
    const trimmed = merged.slice(0, 8);
    cache.set(q.toLowerCase(), trimmed);
    if (cache.size > 20) {
      const oldest = cache.keys().next().value;
      if (typeof oldest === 'string') cache.delete(oldest);
    }
    return trimmed;
  } catch {
    return [];
  } finally {
    if (inflight === ctrl) inflight = null;
  }
}
