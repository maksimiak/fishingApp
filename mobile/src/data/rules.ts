import { SPECIES } from './species';
// Circular import (rules.ts ↔ rules/index.ts) is safe: both sides only use
// the bindings inside function bodies, not at module-eval time.
import { getActiveBlanketClosure, getEffectiveSpeciesRule } from './rules/index';
import type {
  ClosureWindow,
  DateMD,
  Forecast,
  Species,
  WaterBody,
  WaterBodyStatus,
} from './types';

export { getEffectiveSpeciesRule };

function dateKey(m: number, d: number): number {
  return m * 100 + d;
}

export function isInClosedSeason(date: Date, closedSeason: Species['closedSeason']): boolean {
  if (!closedSeason) return false;
  const m = date.getMonth() + 1;
  const d = date.getDate();
  const k = dateKey(m, d);
  const [startM, startD] = closedSeason[0];
  const [endM, endD] = closedSeason[1];
  const start = dateKey(startM, startD);
  const end = dateKey(endM, endD);
  if (start <= end) return k >= start && k <= end;
  return k >= start || k <= end;
}

export function daysUntil(date: Date, targetMonth: number, targetDay: number): number {
  const year = date.getFullYear();
  let t = new Date(year, targetMonth - 1, targetDay);
  if (t < date) t = new Date(year + 1, targetMonth - 1, targetDay);
  const ms = t.getTime() - date.getTime();
  return Math.ceil(ms / (1000 * 60 * 60 * 24));
}

function dayAfter([m, d]: DateMD): DateMD {
  // 2024 is a leap year, which keeps Feb 29 representable if it ever appears.
  const next = new Date(2024, m - 1, d + 1);
  return [next.getMonth() + 1, next.getDate()];
}

function reasonForClosure(closure: ClosureWindow, lang: 'lt' | 'en'): string {
  return lang === 'lt' ? closure.reason.lt : closure.reason.en;
}

export function getStatus(waterbody: WaterBody, date: Date): WaterBodyStatus {
  const speciesList = waterbody.species
    .map((id) => SPECIES.find((s) => s.id === id))
    .filter((s): s is Species => !!s);

  const blanket = getActiveBlanketClosure(waterbody.id, date);
  if (blanket) {
    const [openM, openD] = dayAfter(blanket.end);
    return {
      status: 'closed',
      openSpecies: [],
      closedSpecies: speciesList,
      reasonLt: reasonForClosure(blanket, 'lt'),
      reasonEn: reasonForClosure(blanket, 'en'),
      nextOpeningDays: daysUntil(date, openM, openD),
    };
  }

  const open: Species[] = [];
  const closed: Species[] = [];
  for (const sp of speciesList) {
    const eff = getEffectiveSpeciesRule(sp.id, waterbody.id, date);
    if (eff.status === 'closed') closed.push(sp);
    else open.push(sp);
  }

  const status: WaterBodyStatus['status'] =
    closed.length === 0 ? 'open' : open.length === 0 ? 'closed' : 'partial';

  // Warning lookahead: any open species whose next closure starts within 14 days.
  let warningLt: string | null = null;
  let warningEn: string | null = null;
  for (const sp of open) {
    if (!sp.closedSeason) continue;
    const [startM, startD] = sp.closedSeason[0];
    const days = daysUntil(date, startM, startD);
    if (days <= 14) {
      warningLt = `${sp.nameLt} nerštas artėja`;
      warningEn = `${sp.nameEn} spawning soon`;
      break;
    }
  }

  return {
    status,
    openSpecies: open,
    closedSpecies: closed,
    reasonLt: closed.length ? `${closed.map((s) => s.nameLt).join(', ')} – neršto metas` : null,
    reasonEn: closed.length ? `${closed.map((s) => s.nameEn).join(', ')} – spawning` : null,
    nextOpeningDays: null,
    warningLt,
    warningEn,
  };
}

export function getSpeciesStatus(species: Species, date: Date): 'open' | 'closed' {
  if (isInClosedSeason(date, species.closedSeason)) return 'closed';
  return 'open';
}

// Body-aware variant: consults the merge engine so per-row open/closed
// reflects national rule + body override + active blanket closure. Use this
// from DetailScreen, where the row is shown in the context of one water body.
export function getSpeciesStatusForBody(
  speciesId: string,
  waterBodyId: string,
  date: Date,
): 'open' | 'closed' {
  return getEffectiveSpeciesRule(speciesId, waterBodyId, date).status;
}

export function getForecast(waterbodyId: string, date: Date): Forecast {
  const seed = (waterbodyId.length * 31 + date.getDate() * 7 + date.getMonth()) % 100;
  const temp = 8 + (seed % 18);
  const waterTemp = Math.max(2, temp - 3);
  const wind = 2 + (seed % 8);
  const pressure = 998 + (seed % 30);
  const biteScore = seed % 4;
  const biteLabel = (['poor', 'fair', 'good', 'excellent'] as const)[biteScore];
  const moon = ['🌑', '🌒', '🌓', '🌔', '🌕', '🌖', '🌗', '🌘'][seed % 8];
  return { temp, waterTemp, wind, pressure, biteScore, biteLabel, moon };
}

export function monthDays(year: number, month: number): (Date | null)[] {
  const first = new Date(year, month, 1);
  const firstDay = (first.getDay() + 6) % 7;
  const daysIn = new Date(year, month + 1, 0).getDate();
  const cells: (Date | null)[] = [];
  for (let i = 0; i < firstDay; i++) cells.push(null);
  for (let d = 1; d <= daysIn; d++) cells.push(new Date(year, month, d));
  while (cells.length % 7) cells.push(null);
  return cells;
}

export function fmtDate(date: Date, lang: 'lt' | 'en' = 'lt'): string {
  const months =
    lang === 'lt'
      ? ['saus.', 'vas.', 'kov.', 'bal.', 'geg.', 'birž.', 'liep.', 'rugp.', 'rugs.', 'spal.', 'lapkr.', 'gruod.']
      : ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  return `${date.getDate()} ${months[date.getMonth()]}`;
}

export function fmtFullDate(date: Date, lang: 'lt' | 'en' = 'lt'): string {
  const months =
    lang === 'lt'
      ? ['sausio', 'vasario', 'kovo', 'balandžio', 'gegužės', 'birželio', 'liepos', 'rugpjūčio', 'rugsėjo', 'spalio', 'lapkričio', 'gruodžio']
      : ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
  if (lang === 'lt') return `${date.getFullYear()} ${months[date.getMonth()]} ${date.getDate()} d.`;
  return `${months[date.getMonth()]} ${date.getDate()}, ${date.getFullYear()}`;
}
