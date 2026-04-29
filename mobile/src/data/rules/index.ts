import type {
  ClosureWindow,
  EffectiveSpeciesRule,
  NationalSpeciesRule,
  WaterBodyRules,
  WaterBodySpeciesOverride,
} from '../types';
import { isInClosedSeason } from '../rules';
import { NATIONAL_SPECIES_RULES } from './national';
import { WATER_BODY_RULES } from './waterbodies';

export { NATIONAL_RULES, NATIONAL_SPECIES_RULES } from './national';
export { WATER_BODY_RULES } from './waterbodies';

export function isInClosureWindow(date: Date, window: ClosureWindow): boolean {
  return isInClosedSeason(date, [window.start, window.end]);
}

export function getNationalRule(speciesId: string): NationalSpeciesRule | null {
  return NATIONAL_SPECIES_RULES.find((r) => r.speciesId === speciesId) ?? null;
}

export function getWaterBodyRules(waterBodyId: string): WaterBodyRules | null {
  return WATER_BODY_RULES.find((r) => r.waterBodyId === waterBodyId) ?? null;
}

function findOverride(
  wbRules: WaterBodyRules | null,
  speciesId: string,
): WaterBodySpeciesOverride | null {
  if (!wbRules?.speciesOverrides) return null;
  return wbRules.speciesOverrides.find((o) => o.speciesId === speciesId) ?? null;
}

export function getActiveBlanketClosure(
  waterBodyId: string,
  date: Date,
): ClosureWindow | null {
  const wb = getWaterBodyRules(waterBodyId);
  if (!wb) return null;
  for (const c of wb.blanketClosures) if (isInClosureWindow(date, c)) return c;
  return null;
}

// Returns the closure window that's active on `date`, or null.
function activeClosure(
  windows: ClosureWindow[] | undefined,
  date: Date,
): ClosureWindow | null {
  if (!windows) return null;
  for (const w of windows) if (isInClosureWindow(date, w)) return w;
  return null;
}

export function getEffectiveSpeciesRule(
  speciesId: string,
  waterBodyId: string,
  date: Date,
): EffectiveSpeciesRule {
  const national = getNationalRule(speciesId);
  const wbRules = getWaterBodyRules(waterBodyId);
  const blanket = getActiveBlanketClosure(waterBodyId, date);

  if (blanket) {
    return {
      speciesId,
      status: 'closed',
      minSizeCm: national?.minSizeCm ?? null,
      maxSizeCm: national?.maxSizeCm ?? null,
      dailyBagLimit: national?.dailyBagLimit ?? null,
      activeClosure: blanket,
      appliedOverride: 'blanket',
    };
  }

  const override = findOverride(wbRules, speciesId);
  const closures =
    override?.closures !== undefined ? override.closures : national?.closures ?? [];
  const closure = activeClosure(closures, date);
  const minSizeCm =
    override?.minSizeCm !== undefined ? override.minSizeCm : national?.minSizeCm ?? null;
  const maxSizeCm =
    override?.maxSizeCm !== undefined ? override.maxSizeCm : national?.maxSizeCm ?? null;
  const dailyBagLimit =
    override?.dailyBagLimit !== undefined
      ? override.dailyBagLimit
      : national?.dailyBagLimit ?? null;

  return {
    speciesId,
    status: closure ? 'closed' : 'open',
    minSizeCm,
    maxSizeCm,
    dailyBagLimit,
    activeClosure: closure,
    appliedOverride: override ? 'water-body' : 'national',
  };
}
