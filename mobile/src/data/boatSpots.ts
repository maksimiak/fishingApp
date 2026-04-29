export interface BoatSpot {
  waterBodyName: string;
  name: string;
  lat: number;
  lng: number;
}

export const BOAT_SPOTS: BoatSpot[] = [
  {
    waterBodyName: 'Elektrėnų marios',
    name: 'Elektrėnų marios ties Elektrėnais',
    lat: 54.78050004713365,
    lng: 24.653145536810356,
  },
  {
    waterBodyName: 'Venta',
    name: 'Venta ties Kuršėnais',
    lat: 55.991891002073444,
    lng: 22.938333317612713,
  },
];
