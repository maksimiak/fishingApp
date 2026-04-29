export type Lang = 'lt' | 'en';

export type FishShape = 'long' | 'medium' | 'round';

export interface Species {
  id: string;
  nameLt: string;
  nameEn: string;
  latin: string;
  minSize: number;
  bagLimit: number | null;
  closedSeason: [[number, number], [number, number]] | null;
  habitat: { lt: string; en: string };
  bestBait: { lt: string; en: string };
  bestTime: { lt: string; en: string };
  desc: { lt: string; en: string };
  color: string;
  shape: FishShape;
  licenceRequired?: boolean;
}

export type WaterBodyType = 'lake' | 'river' | 'reservoir' | 'lagoon';

export interface WaterBody {
  id: string;
  nameLt: string;
  nameEn: string;
  type: WaterBodyType;
  x: number;
  y: number;
  lat: number;
  lng: number;
  area: number;
  species: string[];
  region: { lt: string; en: string };
  note: { lt: string; en: string } | null;
  // false = ad-hoc body synthesised from a MapTiler tile feature; absent or
  // true = curated (hand-authored) record from `WATERBODIES`.
  curated?: boolean;
  leased?: boolean | null;
  avgDepthM?: number | null;
  maxDepthM?: number | null;
  shorelineKm?: number | null;
}

export type FishingStatus = 'open' | 'closed' | 'partial';

export interface WaterBodyStatus {
  status: FishingStatus;
  openSpecies: Species[];
  closedSpecies: Species[];
  reasonLt: string | null;
  reasonEn: string | null;
  nextOpeningDays: number | null;
  warningLt?: string | null;
  warningEn?: string | null;
}

export interface Forecast {
  temp: number;
  waterTemp: number;
  wind: number;
  pressure: number;
  biteScore: number;
  biteLabel: 'poor' | 'fair' | 'good' | 'excellent';
  moon: string;
}

export interface Catch {
  id: number;
  speciesId: string;
  size: number;
  weight: number;
  waterbodyId: string;
  date: string;
  notes: { lt: string; en: string } | null;
}

// ---------------------------------------------------------------------------
// Rules schema (Phase 1)
//
// `Species.minSize` / `bagLimit` / `closedSeason` remain as denormalised
// national defaults so existing screens still render. The structured rules
// engine reads from `NationalSpeciesRule` and `WaterBodyRules` below.
// ---------------------------------------------------------------------------

export type DateMD = [month: number, day: number];
export type Bilingual = { lt: string; en: string };

export interface ClosureWindow {
  start: DateMD;
  end: DateMD; // inclusive; year-wraps when end < start
  reason: Bilingual;
  source?: string;
}

export interface NationalSpeciesRule {
  speciesId: string;
  minSizeCm: number | null;
  maxSizeCm: number | null;
  dailyBagLimit: number | null;
  closures: ClosureWindow[];
  notes?: Bilingual;
}

export type SpecialMethod = 'underwater' | 'ice_smelt' | 'trap_net';

export interface WaterBodySpeciesOverride {
  speciesId: string;
  minSizeCm?: number | null;
  maxSizeCm?: number | null;
  dailyBagLimit?: number | null;
  closures?: ClosureWindow[];
}

export interface WaterBodyRules {
  waterBodyId: string;
  blanketClosures: ClosureWindow[];
  speciesOverrides?: WaterBodySpeciesOverride[];
  dailyWeightCapKg?: number;
  allowedSpecialMethods?: SpecialMethod[];
}

export interface ComboBagLimit {
  speciesIds: string[];
  totalDaily: number;
  scope:
    | { kind: 'national' }
    | { kind: 'waterBody'; waterBodyId: string };
  reason?: Bilingual;
}

export interface NationalRules {
  nightFishingBanned: boolean;
  freeFishingDates: DateMD[];
  defaultDailyWeightCapKg: number;
  gear: {
    maxTools: number;
    maxRods: number;
    maxHooksTotal: number;
    maxHooksTotalIceSmelt: number;
  };
  comboBagLimits: ComboBagLimit[];
}

export interface EffectiveSpeciesRule {
  speciesId: string;
  status: 'open' | 'closed';
  minSizeCm: number | null;
  maxSizeCm: number | null;
  dailyBagLimit: number | null;
  activeClosure: ClosureWindow | null;
  appliedOverride: 'national' | 'water-body' | 'blanket';
}
