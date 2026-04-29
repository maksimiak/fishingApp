import type { WaterBody } from './types';

// Lat/lng coordinates for real map overlay (approx centroids of each water body).
// x/y are retained for the stylized SVG map (not used by the real map).
export const WATERBODIES: WaterBody[] = [
  {
    id: 'kaunas-res',
    nameLt: 'Kauno marios',
    nameEn: 'Kaunas Reservoir',
    type: 'reservoir',
    x: 210, y: 155,
    lat: 54.8470, lng: 24.3250,
    area: 6350,
    species: ['pike', 'perch', 'zander', 'bream', 'roach', 'catfish'],
    region: { lt: 'Kauno rajonas', en: 'Kaunas district' },
    note: null,
    leased: false,
  },
  {
    id: 'kursiu',
    nameLt: 'Kuršių marios',
    nameEn: 'Curonian Lagoon',
    type: 'lagoon',
    x: 55, y: 115,
    lat: 55.2500, lng: 21.1000,
    area: 161300,
    species: ['pike', 'perch', 'zander', 'bream', 'roach'],
    region: { lt: 'Klaipėdos rajonas', en: 'Klaipėda district' },
    note: { lt: 'Reikalinga speciali licencija', en: 'Special licence required' },
    leased: false,
  },
  {
    id: 'galve',
    nameLt: 'Galvės ežeras',
    nameEn: 'Lake Galvė',
    type: 'lake',
    x: 235, y: 120,
    lat: 54.6439, lng: 24.9347,
    area: 361,
    species: ['pike', 'perch', 'bream', 'roach', 'tench'],
    region: { lt: 'Trakai', en: 'Trakai' },
    note: { lt: 'Trakų istorinis nac. parkas', en: 'Trakai Historical National Park' },
    leased: false,
  },
  {
    id: 'plateliai',
    nameLt: 'Platelių ežeras',
    nameEn: 'Lake Plateliai',
    type: 'lake',
    x: 70, y: 75,
    lat: 56.0413, lng: 21.8247,
    area: 1200,
    species: ['pike', 'perch', 'zander', 'bream', 'roach', 'tench'],
    region: { lt: 'Žemaitijos nac. parkas', en: 'Samogitia National Park' },
    note: { lt: 'Nacionalinio parko taisyklės', en: 'National park regulations apply' },
    leased: false,
  },
  {
    id: 'drukshiai',
    nameLt: 'Drūkšių ežeras',
    nameEn: 'Lake Drūkšiai',
    type: 'lake',
    x: 355, y: 55,
    lat: 55.6167, lng: 26.6000,
    area: 4490,
    species: ['pike', 'perch', 'zander', 'bream', 'roach'],
    region: { lt: 'Ignalinos rajonas', en: 'Ignalina district' },
    note: null,
    leased: false,
  },
  {
    id: 'dusia',
    nameLt: 'Dusios ežeras',
    nameEn: 'Lake Dusia',
    type: 'lake',
    x: 170, y: 215,
    lat: 54.2728, lng: 23.6258,
    area: 2334,
    species: ['pike', 'perch', 'bream', 'roach', 'tench'],
    region: { lt: 'Lazdijų rajonas', en: 'Lazdijai district' },
    note: null,
    leased: false,
  },
  {
    id: 'siesikai',
    nameLt: 'Siesikų ežeras',
    nameEn: 'Lake Siesikai',
    type: 'lake',
    x: 265, y: 95,
    lat: 55.2783, lng: 24.5383,
    area: 350,
    species: ['pike', 'perch', 'bream', 'roach'],
    region: { lt: 'Ukmergės rajonas', en: 'Ukmergė district' },
    note: null,
    leased: false,
  },
  {
    id: 'rubikiai',
    nameLt: 'Rubikių ežeras',
    nameEn: 'Lake Rubikiai',
    type: 'lake',
    x: 285, y: 75,
    lat: 55.5375, lng: 25.1536,
    area: 968,
    species: ['pike', 'perch', 'bream', 'roach', 'tench'],
    region: { lt: 'Anykščių rajonas', en: 'Anykščiai district' },
    note: null,
    leased: false,
  },
];

export const SAVED_SPOTS_DEFAULT = ['galve', 'kaunas-res', 'plateliai'];

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
    avgDepthM: null,
    maxDepthM: null,
    shorelineKm: null,
  };
}
