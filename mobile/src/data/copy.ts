import type { Lang } from './types';

export interface CopyDict {
  appName: string;
  tabs: { map: string; rules: string; more: string };
  canFish: string;
  cannotFish: string;
  partial: string;
  today: string;
  yes: string;
  no: string;
  rules: string;
  species: string;
  calendar: string;
  savedSpots: string;
  myCatches: string;
  licence: string;
  weather: string;
  forecast: string;
  spawningSeason: string;
  minSize: string;
  bagLimit: string;
  noLimit: string;
  allowedGear: string;
  protectedSpecies: string;
  openSeason: string;
  closedSeason: string;
  search: string;
  nearby: string;
  popular: string;
  save: string;
  saved: string;
  share: string;
  viewRules: string;
  logCatch: string;
  buyLicence: string;
  validUntil: string;
  waterTemp: string;
  wind: string;
  pressure: string;
  moonPhase: string;
  biteIndex: string;
  excellent: string;
  good: string;
  fair: string;
  poor: string;
  recentCatches: string;
  thisWeek: string;
  thisMonth: string;
  size: string;
  weight: string;
  date: string;
  location: string;
  notes: string;
  habitat: string;
  bestBait: string;
  bestTime: string;
  description: string;
  restrictions: string;
  allYear: string;
  reason: string;
  nextOpening: string;
  daysUntil: string;
  dayUntil: string;
  daysTwo: string;
  notFound: string;
  hintLake: string;
  hintRiver: string;
  hintReservoir: string;
  hintLagoon: string;
  tabBiting: string;
  tabInfo: string;
  seasons: string;
  expectedSpecies: string;
  generalDataNote: string;
  moreInfo: string;
  avgDepth: string;
  maxDepth: string;
  shoreline: string;
  fishingPermit: string;
  permitPublic: string;
  permitLeased: string;
  boatLaunch: string;
  stocking: string;
  stockingTotal: string;
}

export const COPY: Record<Lang, CopyDict> = {
  lt: {
    appName: 'FisherMap',
    tabs: { map: 'Žemėlapis', rules: 'Taisyklės', more: 'Daugiau' },
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
    notFound: 'Nerasta',
    hintLake: 'Ežeras',
    hintRiver: 'Upė',
    hintReservoir: 'Marios',
    hintLagoon: 'Marios',
    tabBiting: 'Čia kimba',
    tabInfo: 'Info',
    seasons: 'Žvejybos sezonai',
    expectedSpecies: 'Tikėtinos rūšys',
    generalDataNote: 'Bendri duomenys – specifinės rūšys nežinomos',
    moreInfo: 'Daugiau informacijos',
    avgDepth: 'Vid. gylis',
    maxDepth: 'Did. gylis',
    shoreline: 'Kranto ilgis',
    fishingPermit: 'Žvejybos leidimas',
    permitPublic: 'Žvejoti galima tik turint galiojantį Žvejo mėgėjo bilietą L05.01 arba turint nemokamos žvejybos teisę.',
    permitLeased: 'Telkinys išnuomotas. Reikalingas nuomininko leidimas.',
    boatLaunch: 'Valties įleidimo vieta',
    stocking: 'Įžuvinimai',
    stockingTotal: 'Bendras kiekis',
  },
  en: {
    appName: 'FisherMap',
    tabs: { map: 'Map', rules: 'Rules', more: 'More' },
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
    notFound: 'Not found',
    hintLake: 'Lake',
    hintRiver: 'River',
    hintReservoir: 'Reservoir',
    hintLagoon: 'Lagoon',
    tabBiting: "What's here",
    tabInfo: 'Info',
    seasons: 'Fishing seasons',
    expectedSpecies: 'Expected species',
    generalDataNote: 'General data – specific species unknown',
    moreInfo: 'More info',
    avgDepth: 'Avg. depth',
    maxDepth: 'Max. depth',
    shoreline: 'Shoreline',
    fishingPermit: 'Fishing permit',
    permitPublic: 'Fishing requires a valid Amateur Fishing Licence L05.01 or a free fishing entitlement.',
    permitLeased: 'Water body is leased. A permit from the lessee is required.',
    boatLaunch: 'Boat launch',
    stocking: 'Stocking',
    stockingTotal: 'Total stocked',
  },
};
