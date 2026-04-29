// data.js — Fishing app domain data
// Sources:
//  - Rules logic inspired by zvejogidas.lt/zvejybos-taisykles (Lithuanian recreational fishing rules)
//    Recreated as original logic for the prototype — NOT copying any copyrighted content verbatim.
//  - Fish species data — generic biological info
//
// All data is intentionally simplified for prototype purposes.

// ─── Copy dictionary (LT / EN) ──────────────────────────────────────────────
const COPY = {
  lt: {
    appName: 'Žvejoti',
    tabs: { map: 'Žemėlapis', saved: 'Išsaugoti', log: 'Dienynas', more: 'Daugiau' },
    canFish: 'Galima žvejoti',
    cannotFish: 'Žvejoti draudžiama',
    partial: 'Daliniai apribojimai',
    today: 'Šiandien',
    yes: 'Taip',
    no: 'Ne',
    rules: 'Taisyklės',
    species: 'Rūšys',
    calendar: 'Kalendorius',
    savedSpots: 'Išsaugotos vietos',
    myCatches: 'Mano sugauti',
    licence: 'Licencija',
    weather: 'Orai',
    forecast: 'Kibimo prognozė',
    spawningSeason: 'Neršto metas',
    minSize: 'Min. dydis',
    bagLimit: 'Dienos limitas',
    noLimit: 'Be limito',
    allowedGear: 'Leidžiama įranga',
    protectedSpecies: 'Saugoma rūšis',
    openSeason: 'Leidžiama gaudyti',
    closedSeason: 'Draudžiama gaudyti',
    search: 'Ieškoti vandens telkinio',
    nearby: 'Netoli jūsų',
    popular: 'Populiarūs',
    save: 'Išsaugoti',
    saved: 'Išsaugota',
    share: 'Dalintis',
    viewRules: 'Žiūrėti taisykles',
    logCatch: 'Pridėti sugautą',
    buyLicence: 'Pirkti licenciją',
    validUntil: 'Galioja iki',
    waterTemp: 'Vandens temp.',
    wind: 'Vėjas',
    pressure: 'Slėgis',
    moonPhase: 'Mėnulio fazė',
    biteIndex: 'Kibimo indeksas',
    excellent: 'Puikus',
    good: 'Geras',
    fair: 'Vidutinis',
    poor: 'Prastas',
    recentCatches: 'Paskutiniai sugauti',
    thisWeek: 'Šią savaitę',
    thisMonth: 'Šį mėnesį',
    size: 'Ilgis',
    weight: 'Svoris',
    date: 'Data',
    location: 'Vieta',
    notes: 'Pastabos',
    habitat: 'Buveinė',
    bestBait: 'Geriausias jaukas',
    bestTime: 'Geriausias laikas',
    description: 'Aprašymas',
    restrictions: 'Apribojimai',
    allYear: 'Visus metus',
    reason: 'Priežastis',
    nextOpening: 'Sezonas atsidaro',
    daysUntil: 'dienų',
    dayUntil: 'diena',
    daysTwo: 'dienos',
  },
  en: {
    appName: 'Fishing',
    tabs: { map: 'Map', saved: 'Saved', log: 'Log', more: 'More' },
    canFish: 'Fishing allowed',
    cannotFish: 'Fishing prohibited',
    partial: 'Partial restrictions',
    today: 'Today',
    yes: 'Yes',
    no: 'No',
    rules: 'Rules',
    species: 'Species',
    calendar: 'Calendar',
    savedSpots: 'Saved spots',
    myCatches: 'My catches',
    licence: 'Licence',
    weather: 'Weather',
    forecast: 'Bite forecast',
    spawningSeason: 'Spawning period',
    minSize: 'Min. size',
    bagLimit: 'Daily limit',
    noLimit: 'No limit',
    allowedGear: 'Allowed gear',
    protectedSpecies: 'Protected species',
    openSeason: 'Open season',
    closedSeason: 'Closed season',
    search: 'Search water body',
    nearby: 'Nearby',
    popular: 'Popular',
    save: 'Save',
    saved: 'Saved',
    share: 'Share',
    viewRules: 'View rules',
    logCatch: 'Log catch',
    buyLicence: 'Buy licence',
    validUntil: 'Valid until',
    waterTemp: 'Water temp.',
    wind: 'Wind',
    pressure: 'Pressure',
    moonPhase: 'Moon phase',
    biteIndex: 'Bite index',
    excellent: 'Excellent',
    good: 'Good',
    fair: 'Fair',
    poor: 'Poor',
    recentCatches: 'Recent catches',
    thisWeek: 'This week',
    thisMonth: 'This month',
    size: 'Length',
    weight: 'Weight',
    date: 'Date',
    location: 'Location',
    notes: 'Notes',
    habitat: 'Habitat',
    bestBait: 'Best bait',
    bestTime: 'Best time',
    description: 'Description',
    restrictions: 'Restrictions',
    allYear: 'Year-round',
    reason: 'Reason',
    nextOpening: 'Opens in',
    daysUntil: 'days',
    dayUntil: 'day',
    daysTwo: 'days',
  },
};

// ─── Fish species ────────────────────────────────────────────────────────────
// Each species has: id, names (lt/en/latin), closed seasons [mm-dd, mm-dd],
// min legal size (cm), daily bag limit, habitat, best bait, difficulty.
const SPECIES = [
  {
    id: 'pike',
    nameLt: 'Lydeka',
    nameEn: 'Northern pike',
    latin: 'Esox lucius',
    minSize: 50,
    bagLimit: 3,
    closedSeason: [[2, 1], [4, 30]], // Feb 1 – Apr 30 (spawning)
    habitat: { lt: 'Ežerai, upės, tvenkiniai', en: 'Lakes, rivers, ponds' },
    bestBait: { lt: 'Gyva žuvelė, vobleris, guminukas', en: 'Live bait, crankbait, soft plastic' },
    bestTime: { lt: 'Rytas, vakaras', en: 'Dawn, dusk' },
    desc: {
      lt: 'Plėšrioji žuvis, gyvenanti daugumoje Lietuvos vandens telkinių. Aktyvi po nerštu ir rudenį.',
      en: 'Predatory fish found in most Lithuanian water bodies. Most active after spawning and in autumn.',
    },
    color: '#4a5d3a',
    shape: 'long',
  },
  {
    id: 'perch',
    nameLt: 'Ešerys',
    nameEn: 'European perch',
    latin: 'Perca fluviatilis',
    minSize: 18,
    bagLimit: 5,
    closedSeason: null,
    habitat: { lt: 'Ežerai, upės', en: 'Lakes, rivers' },
    bestBait: { lt: 'Sliekai, mažos žuvelės, blizgės', en: 'Worms, small baitfish, spinners' },
    bestTime: { lt: 'Visą dieną', en: 'All day' },
    desc: {
      lt: 'Dryžuota plėšrioji žuvis, populiari tarp mėgėjų. Gaudo būriais.',
      en: 'Striped predatory fish popular with anglers. Feeds in schools.',
    },
    color: '#5a6f3c',
    shape: 'medium',
  },
  {
    id: 'zander',
    nameLt: 'Starkis',
    nameEn: 'Zander',
    latin: 'Sander lucioperca',
    minSize: 46,
    bagLimit: 3,
    closedSeason: [[3, 1], [5, 31]],
    habitat: { lt: 'Gilūs ežerai, upės', en: 'Deep lakes, rivers' },
    bestBait: { lt: 'Guminukai, gyva žuvelė', en: 'Soft plastics, live bait' },
    bestTime: { lt: 'Naktis, prieblanda', en: 'Night, twilight' },
    desc: {
      lt: 'Gili vandens plėšrūnė, vertinama mėsos kokybe. Aktyvi prieblandoje.',
      en: 'Deep-water predator valued for meat quality. Active at low light.',
    },
    color: '#3f5542',
    shape: 'long',
  },
  {
    id: 'bream',
    nameLt: 'Karšis',
    nameEn: 'Common bream',
    latin: 'Abramis brama',
    minSize: 30,
    bagLimit: 5,
    closedSeason: null,
    habitat: { lt: 'Ežerai, lėtos upės', en: 'Lakes, slow rivers' },
    bestBait: { lt: 'Sliekai, kukurūzai, boilis', en: 'Worms, corn, boilies' },
    bestTime: { lt: 'Vakaras, naktis', en: 'Evening, night' },
    desc: {
      lt: 'Plokščia, taikios prigimties žuvis. Gaudoma dugninėmis meškerėmis.',
      en: 'Flat-bodied peaceful fish. Caught with bottom rigs.',
    },
    color: '#7a6a3e',
    shape: 'round',
  },
  {
    id: 'roach',
    nameLt: 'Kuoja',
    nameEn: 'Roach',
    latin: 'Rutilus rutilus',
    minSize: 0,
    bagLimit: null,
    closedSeason: null,
    habitat: { lt: 'Visi vandens telkiniai', en: 'All water bodies' },
    bestBait: { lt: 'Sliekai, duona, kukurūzai', en: 'Worms, bread, corn' },
    bestTime: { lt: 'Visą dieną', en: 'All day' },
    desc: {
      lt: 'Dažniausiai sutinkama žuvis Lietuvoje. Puikus pasirinkimas pradedantiesiems.',
      en: 'Most common fish in Lithuania. Great choice for beginners.',
    },
    color: '#6b6e4a',
    shape: 'medium',
  },
  {
    id: 'tench',
    nameLt: 'Lynas',
    nameEn: 'Tench',
    latin: 'Tinca tinca',
    minSize: 25,
    bagLimit: 5,
    closedSeason: null,
    habitat: { lt: 'Apaugę ežerai, tvenkiniai', en: 'Weedy lakes, ponds' },
    bestBait: { lt: 'Sliekai, kukurūzai', en: 'Worms, corn' },
    bestTime: { lt: 'Rytas, vakaras', en: 'Morning, evening' },
    desc: {
      lt: 'Tamsi, stipri žuvis, mėgstanti dumblą ir vandens augalus.',
      en: 'Dark, strong fish favouring mud and aquatic plants.',
    },
    color: '#4e5530',
    shape: 'round',
  },
  {
    id: 'catfish',
    nameLt: 'Šamas',
    nameEn: 'Wels catfish',
    latin: 'Silurus glanis',
    minSize: 85,
    bagLimit: 1,
    closedSeason: [[5, 1], [6, 30]],
    habitat: { lt: 'Didelės upės, gilūs ežerai', en: 'Large rivers, deep lakes' },
    bestBait: { lt: 'Didelė gyva žuvis, mėsa', en: 'Large live fish, meat' },
    bestTime: { lt: 'Naktis', en: 'Night' },
    desc: {
      lt: 'Didžiausia Lietuvos gėlavandenė žuvis. Reikia didelės įrangos.',
      en: "Lithuania's largest freshwater fish. Requires heavy tackle.",
    },
    color: '#3a3528',
    shape: 'long',
  },
  {
    id: 'trout',
    nameLt: 'Upėtakis',
    nameEn: 'Brown trout',
    latin: 'Salmo trutta',
    minSize: 30,
    bagLimit: 2,
    closedSeason: [[10, 1], [12, 31]],
    habitat: { lt: 'Sraunios upės', en: 'Fast rivers' },
    bestBait: { lt: 'Dirbtinės muselės, blizgės', en: 'Artificial flies, spinners' },
    bestTime: { lt: 'Rytas', en: 'Morning' },
    desc: {
      lt: 'Šalto vandens žuvis, reikia specialios licencijos daugumai upių.',
      en: 'Cold-water fish, requires special licence on most rivers.',
    },
    color: '#8a6440',
    shape: 'long',
    licenceRequired: true,
  },
];

// ─── Water bodies ────────────────────────────────────────────────────────────
// Coordinates are in the Lithuania SVG viewport (0–400 x, 0–260 y).
// Each has list of species ids, plus any special rules.
const WATERBODIES = [
  {
    id: 'kaunas-res',
    nameLt: 'Kauno marios',
    nameEn: 'Kaunas Reservoir',
    type: 'reservoir',
    x: 210, y: 155,
    area: 6350, // hectares
    species: ['pike', 'perch', 'zander', 'bream', 'roach', 'catfish'],
    region: { lt: 'Kauno rajonas', en: 'Kaunas district' },
    note: null,
  },
  {
    id: 'kursiu',
    nameLt: 'Kuršių marios',
    nameEn: 'Curonian Lagoon',
    type: 'lagoon',
    x: 55, y: 115,
    area: 161300,
    species: ['pike', 'perch', 'zander', 'bream', 'roach'],
    region: { lt: 'Klaipėdos rajonas', en: 'Klaipėda district' },
    note: { lt: 'Reikalinga speciali licencija', en: 'Special licence required' },
  },
  {
    id: 'galve',
    nameLt: 'Galvės ežeras',
    nameEn: 'Lake Galvė',
    type: 'lake',
    x: 235, y: 120,
    area: 361,
    species: ['pike', 'perch', 'bream', 'roach', 'tench'],
    region: { lt: 'Trakai', en: 'Trakai' },
    note: { lt: 'Trakų istorinis nac. parkas', en: 'Trakai Historical National Park' },
  },
  {
    id: 'plateliai',
    nameLt: 'Platelių ežeras',
    nameEn: 'Lake Plateliai',
    type: 'lake',
    x: 70, y: 75,
    area: 1200,
    species: ['pike', 'perch', 'zander', 'bream', 'roach', 'tench'],
    region: { lt: 'Žemaitijos nac. parkas', en: 'Samogitia National Park' },
    note: { lt: 'Nacionalinio parko taisyklės', en: 'National park regulations apply' },
  },
  {
    id: 'drukshiai',
    nameLt: 'Drūkšių ežeras',
    nameEn: 'Lake Drūkšiai',
    type: 'lake',
    x: 355, y: 55,
    area: 4490,
    species: ['pike', 'perch', 'zander', 'bream', 'roach'],
    region: { lt: 'Ignalinos rajonas', en: 'Ignalina district' },
    note: null,
  },
  {
    id: 'nemunas',
    nameLt: 'Nemunas',
    nameEn: 'Nemunas River',
    type: 'river',
    x: 175, y: 180,
    area: 937, // km length
    species: ['pike', 'perch', 'zander', 'bream', 'roach', 'catfish', 'trout'],
    region: { lt: 'Visa Lietuva', en: 'Nationwide' },
    note: { lt: 'Apribojimai skiriasi pagal atkarpą', en: 'Restrictions vary by stretch' },
  },
  {
    id: 'neris',
    nameLt: 'Neris',
    nameEn: 'Neris River',
    type: 'river',
    x: 260, y: 130,
    area: 510,
    species: ['pike', 'perch', 'zander', 'roach', 'trout'],
    region: { lt: 'Vilnius – Kaunas', en: 'Vilnius – Kaunas' },
    note: null,
  },
  {
    id: 'dusia',
    nameLt: 'Dusios ežeras',
    nameEn: 'Lake Dusia',
    type: 'lake',
    x: 170, y: 215,
    area: 2334,
    species: ['pike', 'perch', 'bream', 'roach', 'tench'],
    region: { lt: 'Lazdijų rajonas', en: 'Lazdijai district' },
    note: null,
  },
  {
    id: 'siesikai',
    nameLt: 'Siesikų ežeras',
    nameEn: 'Lake Siesikai',
    type: 'lake',
    x: 265, y: 95,
    area: 350,
    species: ['pike', 'perch', 'bream', 'roach'],
    region: { lt: 'Ukmergės rajonas', en: 'Ukmergė district' },
    note: null,
  },
  {
    id: 'rubikiai',
    nameLt: 'Rubikių ežeras',
    nameEn: 'Lake Rubikiai',
    type: 'lake',
    x: 285, y: 75,
    area: 968,
    species: ['pike', 'perch', 'bream', 'roach', 'tench'],
    region: { lt: 'Anykščių rajonas', en: 'Anykščiai district' },
    note: null,
  },
];

// ─── Rules logic ─────────────────────────────────────────────────────────────
// Given a date and water body, returns a status object.
// This is ORIGINAL prototype logic loosely inspired by Lithuanian recreational
// fishing rules. Not copied from any source verbatim.

function dateKey(m, d) { return m * 100 + d; }

function isInClosedSeason(date, closedSeason) {
  if (!closedSeason) return false;
  const m = date.getMonth() + 1;
  const d = date.getDate();
  const k = dateKey(m, d);
  const [startM, startD] = closedSeason[0];
  const [endM, endD] = closedSeason[1];
  const start = dateKey(startM, startD);
  const end = dateKey(endM, endD);
  if (start <= end) return k >= start && k <= end;
  return k >= start || k <= end; // wraps year
}

function daysUntil(date, targetMonth, targetDay) {
  const year = date.getFullYear();
  let t = new Date(year, targetMonth - 1, targetDay);
  if (t < date) t = new Date(year + 1, targetMonth - 1, targetDay);
  const ms = t - date;
  return Math.ceil(ms / (1000 * 60 * 60 * 24));
}

// Returns status for a water body on a date:
//   { status: 'open' | 'closed' | 'partial',
//     openSpecies: [...species],
//     closedSpecies: [...species],
//     reasonLt, reasonEn, nextOpeningDays }
function getStatus(waterbody, date) {
  const speciesList = waterbody.species.map(id => SPECIES.find(s => s.id === id));
  const open = [];
  const closed = [];
  speciesList.forEach(sp => {
    if (isInClosedSeason(date, sp.closedSeason)) closed.push(sp);
    else open.push(sp);
  });

  // General national pike spawning closure Feb 1 – Apr 30 — if pike is closed
  // AND this is the main predator, flag as partial.
  let status;
  if (closed.length === 0) status = 'open';
  else if (open.length === 0) status = 'closed';
  else status = 'partial';

  // Winter blanket closure for some protected lakes — example: Galvė (Dec 15 – Apr 15)
  if (waterbody.id === 'galve') {
    const m = date.getMonth() + 1, d = date.getDate();
    const k = dateKey(m, d);
    if (k >= dateKey(12, 15) || k <= dateKey(4, 15)) {
      return {
        status: 'closed',
        openSpecies: [],
        closedSpecies: speciesList,
        reasonLt: 'Trakų ežero žiemos draudimas (12-15 – 04-15)',
        reasonEn: 'Trakai winter closure (Dec 15 – Apr 15)',
        nextOpeningDays: daysUntil(date, 4, 16),
      };
    }
  }

  const nextClosedSoon = open.find(sp => {
    if (!sp.closedSeason) return false;
    const [startM, startD] = sp.closedSeason[0];
    const days = daysUntil(date, startM, startD);
    return days <= 14;
  });

  return {
    status,
    openSpecies: open,
    closedSpecies: closed,
    reasonLt: closed.length ? `${closed.map(s => s.nameLt).join(', ')} – neršto metas` : null,
    reasonEn: closed.length ? `${closed.map(s => s.nameEn).join(', ')} – spawning` : null,
    nextOpeningDays: null,
    warningLt: nextClosedSoon ? `${nextClosedSoon.nameLt} nerštas artėja` : null,
    warningEn: nextClosedSoon ? `${nextClosedSoon.nameEn} spawning soon` : null,
  };
}

// Status for a species alone on a date
function getSpeciesStatus(species, date) {
  if (isInClosedSeason(date, species.closedSeason)) return 'closed';
  return 'open';
}

// ─── Weather / bite forecast (mocked) ───────────────────────────────────────
function getForecast(waterbodyId, date) {
  // Deterministic based on id+date so it feels stable
  const seed = (waterbodyId.length * 31 + date.getDate() * 7 + date.getMonth()) % 100;
  const temp = 8 + (seed % 18); // air
  const waterTemp = Math.max(2, temp - 3);
  const wind = 2 + (seed % 8);
  const pressure = 998 + (seed % 30);
  const biteScore = (seed % 4); // 0..3
  const biteLabel = ['poor', 'fair', 'good', 'excellent'][biteScore];
  const moon = ['🌑','🌒','🌓','🌔','🌕','🌖','🌗','🌘'][seed % 8];
  return { temp, waterTemp, wind, pressure, biteScore, biteLabel, moon };
}

// ─── Mock user data ──────────────────────────────────────────────────────────
const SAVED_SPOTS = ['galve', 'kaunas-res', 'plateliai'];

const MY_CATCHES = [
  { id: 1, speciesId: 'pike', size: 68, weight: 2.4, waterbodyId: 'galve', date: '2026-04-12', notes: { lt: 'Prie salos, vobleris', en: 'Near the island, on crankbait' } },
  { id: 2, speciesId: 'perch', size: 28, weight: 0.4, waterbodyId: 'kaunas-res', date: '2026-04-10', notes: { lt: 'Sliekas, 3m gylis', en: 'Worm, 3m depth' } },
  { id: 3, speciesId: 'zander', size: 52, weight: 1.6, waterbodyId: 'kaunas-res', date: '2026-04-05', notes: { lt: 'Prieblanda, guminukas', en: 'Twilight, soft plastic' } },
  { id: 4, speciesId: 'bream', size: 41, weight: 1.1, waterbodyId: 'dusia', date: '2026-03-28', notes: { lt: 'Kukurūzai', en: 'Corn' } },
  { id: 5, speciesId: 'roach', size: 18, weight: 0.15, waterbodyId: 'galve', date: '2026-03-22', notes: null },
];

// ─── Nicely-shaped month calendar ────────────────────────────────────────────
function monthDays(year, month /* 0-indexed */) {
  const first = new Date(year, month, 1);
  const firstDay = (first.getDay() + 6) % 7; // Monday-first
  const daysIn = new Date(year, month + 1, 0).getDate();
  const cells = [];
  for (let i = 0; i < firstDay; i++) cells.push(null);
  for (let d = 1; d <= daysIn; d++) cells.push(new Date(year, month, d));
  while (cells.length % 7) cells.push(null);
  return cells;
}

Object.assign(window, {
  COPY, SPECIES, WATERBODIES, SAVED_SPOTS, MY_CATCHES,
  getStatus, getSpeciesStatus, isInClosedSeason, getForecast, monthDays, daysUntil,
});
