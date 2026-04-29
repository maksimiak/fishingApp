import type { NationalRules, NationalSpeciesRule } from '../types';

// Source: Mėgėjų žvejybos vidaus vandenyse taisyklės (LT inland-waters
// amateur fishing rules), the official statute. zvejogidas.lt republishes
// the verbatim text, atnaujinta 2024-04-30:
//   https://zvejogidas.lt/zvejybos-taisykles
// Section references below point to that text.
//
// Per-water-body carve-outs (Annex 2 pike-size waiver in listed rivers,
// Nemunas Delta bream Apr 20 – May 20, Curonian 7 kg cap, etc.) live in
// `waterbodies.ts` rather than here.
const SOURCE_URL = 'https://zvejogidas.lt/zvejybos-taisykles';

export const NATIONAL_SPECIES_RULES: NationalSpeciesRule[] = [
  {
    speciesId: 'pike',
    // §11.3.8 size 50–80 (waived in Annex 2 rivers); §11.1.9 closure;
    // §6 bag 2 (within the predator-combo cap of 5).
    minSizeCm: 50,
    maxSizeCm: 80,
    dailyBagLimit: 2,
    closures: [
      {
        start: [2, 1],
        end: [4, 30],
        reason: { lt: 'Lydekos nerštas', en: 'Pike spawning' },
        source: SOURCE_URL,
      },
    ],
  },
  {
    speciesId: 'perch',
    // Not listed in §11.1 (no closure), §11.3 (no national size), or §6
    // (no individual count cap). Only the 5 kg/day total weight cap applies.
    minSizeCm: null,
    maxSizeCm: null,
    dailyBagLimit: null,
    closures: [],
  },
  {
    speciesId: 'zander',
    // §11.3.7 size 50–65; §11.1.10 closure; §6 bag 2.
    minSizeCm: 50,
    maxSizeCm: 65,
    dailyBagLimit: 2,
    closures: [
      {
        start: [3, 1],
        end: [5, 31],
        reason: { lt: 'Starkio nerštas', en: 'Zander spawning' },
        source: SOURCE_URL,
      },
    ],
  },
  {
    speciesId: 'bream',
    // Not in §11.3 (no national size) or §6 (no count cap). Nemuno delta
    // regional closure (§11.1.19) → handled as per-water-body override.
    minSizeCm: null,
    maxSizeCm: null,
    dailyBagLimit: null,
    closures: [],
  },
  {
    speciesId: 'roach',
    // Not in §11.1 / §11.3 / §6. Only the 5 kg total cap applies.
    minSizeCm: null,
    maxSizeCm: null,
    dailyBagLimit: null,
    closures: [],
  },
  {
    speciesId: 'tench',
    // §11.3.12: min 25; not in §6 (no count cap).
    minSizeCm: 25,
    maxSizeCm: null,
    dailyBagLimit: null,
    closures: [],
  },
  {
    speciesId: 'catfish',
    // §11.3.1 min 75; §11.1.17 closure; §6 bag 1.
    minSizeCm: 75,
    maxSizeCm: null,
    dailyBagLimit: 1,
    closures: [
      {
        start: [11, 1],
        end: [4, 1],
        reason: { lt: 'Šamų draudimo laikotarpis', en: 'Catfish closed season' },
        source: SOURCE_URL,
      },
    ],
  },
  {
    speciesId: 'trout',
    // §11.1.13 closure; §6 bag 2; §11.2.3 requires žvejo mėgėjo kortelė
    // (special licence) to take fish. Not in §11.3 — the size limit lives
    // in the per-water licence terms (commonly 30 cm), so we leave it null
    // here and surface it via per-water-body overrides in Phase 3.
    minSizeCm: null,
    maxSizeCm: null,
    dailyBagLimit: 2,
    closures: [
      {
        start: [10, 1],
        end: [12, 31],
        reason: { lt: 'Upėtakių nerštas', en: 'Brown trout spawning' },
        source: SOURCE_URL,
      },
    ],
    notes: {
      lt: 'Reikalinga žvejo mėgėjo kortelė; pasiimti leidžiama tik nurodytuose vandens telkiniuose',
      en: 'Special licence required; take only on listed waters',
    },
  },
  {
    speciesId: 'asp',
    // §11.3.6 size 55; §11.1.7 closure Apr 1 – May 15; §6 bag 2 within the
    // 5-fish predator combo cap.
    minSizeCm: 55,
    maxSizeCm: null,
    dailyBagLimit: 2,
    closures: [
      {
        start: [4, 1],
        end: [5, 15],
        reason: { lt: 'Salatio nerštas', en: 'Asp spawning' },
        source: SOURCE_URL,
      },
    ],
  },
  {
    speciesId: 'grayling',
    // §11.3.5 size 30; §11.1.5 closure Mar 1 – May 15; §6 bag 2 within combo cap.
    minSizeCm: 30,
    maxSizeCm: null,
    dailyBagLimit: 2,
    closures: [
      {
        start: [3, 1],
        end: [5, 15],
        reason: { lt: 'Kiršlio nerštas', en: 'Grayling spawning' },
        source: SOURCE_URL,
      },
    ],
  },
  {
    speciesId: 'burbot',
    // §11.3.4 size 45; §11.1.4 closure Dec 15 – Jan 31 (year-wrap); §6 bag 3.
    minSizeCm: 45,
    maxSizeCm: null,
    dailyBagLimit: 3,
    closures: [
      {
        start: [12, 15],
        end: [1, 31],
        reason: { lt: 'Vėgėlės nerštas', en: 'Burbot spawning' },
        source: SOURCE_URL,
      },
    ],
  },
  {
    speciesId: 'eel',
    // Not in §11.1 (no national closure) or §11.3 (no national size). §6 bag 3.
    // Curonian Lagoon ban handled as per-water-body override.
    minSizeCm: null,
    maxSizeCm: null,
    dailyBagLimit: 3,
    closures: [],
    notes: {
      lt: 'Kuršių mariose – draudžiama gaudyti',
      en: 'Forbidden in the Curonian Lagoon',
    },
  },
  {
    speciesId: 'vimba',
    // §11.3.10 size 30; §11.1.14 closure May 15 – Jun 15; §6 bag 5.
    minSizeCm: 30,
    maxSizeCm: null,
    dailyBagLimit: 5,
    closures: [
      {
        start: [5, 15],
        end: [6, 15],
        reason: { lt: 'Žiobrio nerštas', en: 'Vimba spawning' },
        source: SOURCE_URL,
      },
    ],
  },
  {
    speciesId: 'chub',
    // §11.3.11 size 30; not in §11.1; §6 bag 5 (within predator combo cap).
    minSizeCm: 30,
    maxSizeCm: null,
    dailyBagLimit: 5,
    closures: [],
  },
  {
    speciesId: 'ide',
    // §11.3.9 size 30; not in §11.1; §6 bag 5 (within predator combo cap).
    minSizeCm: 30,
    maxSizeCm: null,
    dailyBagLimit: 5,
    closures: [],
  },
  {
    speciesId: 'carp',
    // §11.3.13 size 40; not in §11.1; §6 bag 5.
    minSizeCm: 40,
    maxSizeCm: null,
    dailyBagLimit: 5,
    closures: [],
  },
  {
    speciesId: 'salmon',
    // §11.2 requires kortelė; §11.3 size 65; bag/closure governed by per-water
    // licence terms. We leave bag/closures null here.
    minSizeCm: 65,
    maxSizeCm: null,
    dailyBagLimit: null,
    closures: [],
    notes: {
      lt: 'Reikalinga atskira licencija; sąlygos – pagal vandens telkinio leidimą',
      en: 'Special licence required; bag and closure per water-body permit',
    },
  },
  {
    speciesId: 'sea-trout',
    // §11.2 requires kortelė; §11.3 size 65; bag/closure governed by per-water
    // licence terms.
    minSizeCm: 65,
    maxSizeCm: null,
    dailyBagLimit: null,
    closures: [],
    notes: {
      lt: 'Reikalinga atskira licencija; sąlygos – pagal vandens telkinio leidimą',
      en: 'Special licence required; bag and closure per water-body permit',
    },
  },
  {
    speciesId: 'whitefish',
    // §11.3.2 size 40; §11.1.16 closure Oct 1 – Dec 31; bag governed by
    // per-water licence terms.
    minSizeCm: 40,
    maxSizeCm: null,
    dailyBagLimit: null,
    closures: [
      {
        start: [10, 1],
        end: [12, 31],
        reason: { lt: 'Syko nerštas', en: 'Whitefish spawning' },
        source: SOURCE_URL,
      },
    ],
    notes: {
      lt: 'Pasiimti leidžiama tik nurodytuose ežeruose pagal licenciją',
      en: 'Take allowed only on listed lakes under licence',
    },
  },
  {
    speciesId: 'river-lamprey',
    // §11.2 requires licence; gear-restricted (specialised traps). No §11.3 size
    // or §11.1 generic closure — the season is set in the licence.
    minSizeCm: null,
    maxSizeCm: null,
    dailyBagLimit: null,
    closures: [],
    notes: {
      lt: 'Gaudoma tik specialiomis gaudyklėmis pagal atskirą licenciją',
      en: 'Caught only with specialised traps under a separate licence',
    },
  },
  {
    speciesId: 'crayfish',
    // §11.3 size 10; §11.1 closure Oct 15 – Jul 15 (year-wrap); §5 limits
    // gear to ≤5 vėžiagaudės. §6 has no count cap on crayfish.
    minSizeCm: 10,
    maxSizeCm: null,
    dailyBagLimit: null,
    closures: [
      {
        start: [10, 15],
        end: [7, 15],
        reason: { lt: 'Vėžių draudimo laikotarpis', en: 'Crayfish closed season' },
        source: SOURCE_URL,
      },
    ],
    notes: {
      lt: 'Gaudoma tik vėžiagaudėmis (iki 5 vnt. žvejui)',
      en: 'Caught only with traps (max 5 traps per angler)',
    },
  },
];

// Non-species global rules. Source: §5 (gear), §6 (combo bag + weight cap),
// §10.1 (free fishing days), §9 (bans). zvejogidas.lt /zvejybos-taisykles.
export const NATIONAL_RULES: NationalRules = {
  // §9 implies night ban via specific time-of-day restrictions on listed
  // stretches (e.g. §10.10, §10.16, §10.23). There is no blanket nationwide
  // night ban — leaving false until Phase 5 surfaces the per-stretch rules.
  nightFishingBanned: false,
  freeFishingDates: [
    [2, 16], // Lietuvos valstybės atkūrimo diena
    [3, 11], // Lietuvos nepriklausomybės atkūrimo diena
    [7, 6], // Karaliaus Mindaugo karūnavimo diena
    [8, 15], // Žolinė
  ],
  defaultDailyWeightCapKg: 5,
  gear: {
    // §5: 4 fishing tools + 5 crayfish traps; max 2 rods from a boat;
    // total hooks ≤ 6 (≤ 12 for smelt and sea-trout fishing).
    maxTools: 4,
    maxRods: 2,
    maxHooksTotal: 6,
    maxHooksTotalIceSmelt: 12,
  },
  comboBagLimits: [
    {
      // §6 combined cap: max 5 fish total across pike, zander, brown trout,
      // grayling, asp, barbel, burbot, eel, chub, ide. Barbel isn't surfaced
      // in our species set yet — every other species in the §6 list is.
      speciesIds: ['pike', 'zander', 'trout', 'grayling', 'asp', 'burbot', 'eel', 'chub', 'ide'],
      totalDaily: 5,
      scope: { kind: 'national' },
      reason: {
        lt: 'Bendra 5 vnt. paros norma plėšriosioms žuvims',
        en: 'Combined 5 fish/day cap across listed predators',
      },
    },
  ],
};
