import type { WaterBody } from './types';

export const WATERBODIES: WaterBody[] = [];

// Lithuania bounding box for map camera defaults
export const LITHUANIA_BOUNDS = {
  sw: { lng: 20.9, lat: 53.9 },
  ne: { lng: 26.9, lat: 56.5 },
  center: { lng: 23.88, lat: 55.17 },
};

// Source-of-truth feature props for an ad-hoc body — populated from a UETK
// kadastro entry or, in legacy paths, from a MapTiler vector tile.
export interface WaterTileProps {
  name?: string;
  name_lt?: string;
  name_en?: string;
  class?: string;        // 'river' | 'lake' | 'reservoir' | 'lagoon' | 'pond'
  osm_id?: string | number;
  kadastro_id?: string;  // UETK cadastre id when the source is the UETK GDB
  lat?: number;
  lng?: number;
  area?: number;         // area_ha for lakes, length_km for rivers
  leased?: boolean | null;
  avgDepthM?: number | null;
  maxDepthM?: number | null;
  shorelineKm?: number | null;
}

function slugify(input: string): string {
  return input
    .toLowerCase()
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')
    .slice(0, 48);
}

// Stable id for non-curated bodies. Priority: UETK kadastro_id (authoritative
// Lithuanian cadastre) → OSM id → slug of name+coords.
export function makeAdHocWaterBodyId(props: WaterTileProps): string {
  if (props.kadastro_id) return `uetk:${props.kadastro_id}`;
  if (props.osm_id !== undefined && props.osm_id !== null && props.osm_id !== '') {
    return `osm:${props.osm_id}`;
  }
  const name = props.name_lt ?? props.name ?? props.name_en ?? 'water';
  const lat = props.lat ?? 0;
  const lng = props.lng ?? 0;
  return `wb:${slugify(name)}-${lat.toFixed(3)}-${lng.toFixed(3)}`;
}

function typeFromClass(cls: string | undefined): WaterBody['type'] {
  if (cls === 'river') return 'river';
  if (cls === 'lagoon') return 'lagoon';
  if (cls === 'reservoir') return 'reservoir';
  return 'lake';
}

// Resolve a `WaterBody` for any tappable id. Curated 10 are returned verbatim
// so WATER_BODY_RULES overrides apply. Otherwise synthesise a stub from the
// passed props (UETK or tile origin) — DetailScreen falls back to the full
// national species list when stub.species is empty.
export function resolveWaterBody(
  id: string,
  tileProps?: WaterTileProps,
): WaterBody | null {
  const curated = WATERBODIES.find((w) => w.id === id);
  if (curated) return curated;
  if (!tileProps) return null;
  const name = tileProps.name_lt ?? tileProps.name ?? tileProps.name_en ?? '';
  const nameEn = tileProps.name_en ?? tileProps.name ?? tileProps.name_lt ?? '';
  const type = typeFromClass(tileProps.class);
  return {
    id,
    nameLt: name,
    nameEn,
    type,
    x: 0,
    y: 0,
    lat: tileProps.lat ?? 0,
    lng: tileProps.lng ?? 0,
    area: tileProps.area ?? 0,
    species: [],
    region: { lt: '', en: '' },
    note: null,
    curated: false,
    leased: false,
    avgDepthM: tileProps.avgDepthM ?? null,
    maxDepthM: tileProps.maxDepthM ?? null,
    shorelineKm: tileProps.shorelineKm ?? null,
  };
}
