export interface PondAnalytics {
  pondId: number;
  averagePH: number;
  averageDO: number;
  averageTemperature: number;
  averageWaterLevel: number;
  totalFeedKg: number;
  estimatedBiomassKg: number;
  feedConversionRatio: number;
  waterEfficiency: number;
  feedEfficiency: number;
}
