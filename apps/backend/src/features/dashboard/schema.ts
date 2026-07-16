import type { PondSelect } from "../ponds/schema";

export interface DashboardOverview {
  ponds: PondSelect[];
  latestEnvironment: {
    dissolvedOxygen: number;
    pH: number;
    waterLevel: number;
    temperature: number;
    hasAlert: boolean;
    timestamp: string;
  } | null;
  biomass: number;
  harvestPrediction: number;
  feedToday: number;
  alerts: {
    id: number;
    pondId: number;
    pondName: string;
    dissolvedOxygen: number;
    pH: number;
    waterLevel: number;
    temperature: number;
    timestamp: string;
  }[];
  waterEfficiency: number;
}
