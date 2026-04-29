import type { Catch } from './types';

export const MY_CATCHES: Catch[] = [
  { id: 1, speciesId: 'pike', size: 68, weight: 2.4, waterbodyId: 'galve', date: '2026-04-12', notes: { lt: 'Prie salos, vobleris', en: 'Near the island, on crankbait' } },
  { id: 2, speciesId: 'perch', size: 28, weight: 0.4, waterbodyId: 'kaunas-res', date: '2026-04-10', notes: { lt: 'Sliekas, 3m gylis', en: 'Worm, 3m depth' } },
  { id: 3, speciesId: 'zander', size: 52, weight: 1.6, waterbodyId: 'kaunas-res', date: '2026-04-05', notes: { lt: 'Prieblanda, guminukas', en: 'Twilight, soft plastic' } },
  { id: 4, speciesId: 'bream', size: 41, weight: 1.1, waterbodyId: 'dusia', date: '2026-03-28', notes: { lt: 'Kukurūzai', en: 'Corn' } },
  { id: 5, speciesId: 'roach', size: 18, weight: 0.15, waterbodyId: 'galve', date: '2026-03-22', notes: null },
];
