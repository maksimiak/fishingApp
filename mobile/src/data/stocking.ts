import rawData from './stocking.json';

export interface StockingAge {
  label: string;
  count: number;
}

export interface StockingFish {
  fish: string;
  count: number;
  ages: StockingAge[];
}

export interface StockingEntry {
  total: number;
  byYear: Record<string, StockingFish[]>;
}

export const STOCKING = rawData as unknown as Record<string, StockingEntry>;
