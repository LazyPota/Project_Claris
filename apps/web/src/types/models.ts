export interface EnvironmentData {
  dissolvedOxygen: number;
  pH: number;
  waterLevel: number;
  temperature: number;
  hasAlert: boolean;
  timestamp: string;
}

export interface HarvestRecord {
  date: string;
  estimatedBiomassKg: number;
  actualYieldKg: number;
  pondId: string;
  species: string;
}

export interface FeedingEvent {
  date: string;
  feedType: string;
  amountKg: number;
  pondId: string;
}
