import type { WaterBodyRules } from '../types';

// Per-water-body overrides on top of the national §11 rules.
// Source: Mėgėjų žvejybos vidaus vandenyse taisyklės, AAD (aad.lrv.lt).
const SOURCE_URL = 'https://aad.lrv.lt';

export const WATER_BODY_RULES: WaterBodyRules[] = [
  {
    // Galvė lies inside Trakų istorinis nacionalinis parkas, which is
    // governed by the park's §11.1.2 winter closure (Dec 15 – Apr 15).
    waterBodyId: 'galve',
    blanketClosures: [
      {
        start: [12, 15],
        end: [4, 15],
        reason: {
          lt: 'Trakų ežero žiemos draudimas (12-15 – 04-15)',
          en: 'Trakai winter closure (Dec 15 – Apr 15)',
        },
        source: SOURCE_URL,
      },
    ],
  },
  {
    // Curonian Lagoon: §10.16 raises the daily weight cap to 7 kg and
    // §11.1.20 forbids taking eel. Catfish national rule (§11.1.17 closure
    // and 75 cm size) still applies.
    waterBodyId: 'kursiu',
    blanketClosures: [],
    dailyWeightCapKg: 7,
    speciesOverrides: [
      {
        speciesId: 'eel',
        dailyBagLimit: 0,
        // Year-round closure — surface as a body-level override so the merge
        // engine flips status to closed for any date.
        closures: [
          {
            start: [1, 1],
            end: [12, 31],
            reason: {
              lt: 'Kuršių mariose unguriai draudžiami visus metus',
              en: 'Eel forbidden year-round in the Curonian Lagoon',
            },
            source: SOURCE_URL,
          },
        ],
      },
    ],
  },
];
