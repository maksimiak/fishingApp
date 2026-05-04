export interface BoatSpot {
  name: string;
  lat: number;
  lng: number;
  uetkId: string;
}

export const BOAT_SPOTS: BoatSpot[] = [
  { name: 'Elektrėnų marios ties Elektrėnais', lat: 54.78050004713365, lng: 24.653145536810356, uetkId: '10050291' },
  { name: 'Elektrėnų marios ties Pastrėviu', lat: 54.71746083184293, lng: 24.67455425714956, uetkId: '10050291' },
  { name: 'Venta ties Kuršėnais', lat: 55.991891002073444, lng: 22.938333317612713, uetkId: '30050003' },
  { name: 'Liberiškio tvenkinys', lat: 55.70692724466912, lng: 24.112728111912737, uetkId: '13050045' },
  { name: 'Arino ežeras', lat: 55.07357087177615, lng: 25.669216374144817, uetkId: '12140420' },
  { name: 'Platelių ežeras', lat: 56.07084094495706, lng: 21.832790631567175, uetkId: '17040030' },
  { name: 'Kupiškio marios ties Palėvenėle', lat: 55.898960450123695, lng: 24.998822680911008, uetkId: '41050100' },
  { name: 'Kupiškio marios ties Vėžionimis', lat: 55.89830352384402, lng: 25.011341904727885, uetkId: '41050100' },
  { name: 'Kupiškio marios ties Drūlėnais', lat: 55.86658621829304, lng: 24.97150425109901, uetkId: '41050100' },
  { name: 'Antalieptės marios', lat: 55.6425746948085, lng: 25.930118237502008, uetkId: '12250001' },
  // Water bodies below are not yet in the local UETK dataset; uetkId will be added when data is available
  { name: 'Kauno marios ties Rumšiškėmis', lat: 54.85889519566811, lng: 24.21468048260249, uetkId: '' },
  { name: 'Kauno marios ties Grabučiškėmis', lat: 54.89306283076963, lng: 24.145976588304933, uetkId: '' },
  { name: 'Kauno marios ties Kapitoniškėmis', lat: 54.83464799561173, lng: 24.218693841562718, uetkId: '' },
  { name: 'Juodžio ežeras', lat: 55.47326831651257, lng: 24.478814864713154, uetkId: '' },
  { name: 'Dusios ežeras', lat: 54.26847799049034, lng: 23.72797507567099, uetkId: '' },
  { name: 'Lūksto ežeras', lat: 55.71295636546879, lng: 22.352918479189203, uetkId: '' },
  { name: 'Masčio ežeras', lat: 55.97383864311974, lng: 22.2600230639973, uetkId: '' },
  { name: 'Dūrių ežeras', lat: 55.24858202702699, lng: 25.40728696931788, uetkId: '' },
  { name: 'Galuonų ežeras', lat: 55.14572071644447, lng: 25.484644230679883, uetkId: '' },
  { name: 'Siesarties up. ties Molėtais', lat: 55.231667717636796, lng: 25.44433861965021, uetkId: '' },
  { name: 'Alaušų ežeras', lat: 55.29389821457418, lng: 25.115242295868327, uetkId: '' },
  { name: 'Vištyčio ežeras', lat: 54.45170633210484, lng: 22.720359336149155, uetkId: '' },
  { name: 'Beržoro ežeras', lat: 56.022902921950724, lng: 21.82661468215503, uetkId: '' },
  { name: 'Gondingos tvenkinys (1)', lat: 55.91180857029748, lng: 21.83348930748688, uetkId: '' },
  { name: 'Gondingos tvenkinys (2)', lat: 55.908049812717294, lng: 21.794703318645524, uetkId: '' },
  { name: 'Sartų ežeras', lat: 55.774426513113426, lng: 25.82266056260374, uetkId: '' },
];
