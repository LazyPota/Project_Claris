import { db, eq, and, desc } from "@project-clarias/database";
import { environmentLog, feedingLog, harvestLog, pond } from "@project-clarias/database/schema/aquaculture";
import type { PondAnalytics } from "./schema";

export class AnalyticsService {
  static async verifyPondOwner(pondId: number, userId: number): Promise<boolean> {
    const [result] = await db
      .select({ id: pond.id })
      .from(pond)
      .where(and(eq(pond.id, pondId), eq(pond.userId, userId)));
    return !!result;
  }

  static async getAnalytics(pondId: number, userId: number): Promise<PondAnalytics | null> {
    const isOwner = await this.verifyPondOwner(pondId, userId);
    if (!isOwner) return null;

    // 1. Fetch environmental averages
    const envLogs = await db
      .select()
      .from(environmentLog)
      .where(eq(environmentLog.pondId, pondId));

    let averagePH = 0;
    let averageDO = 0;
    let averageTemperature = 0;
    let averageWaterLevel = 0;
    let waterEfficiency = 0;
    let feedEfficiency = 0;

    if (envLogs.length > 0) {
      let totalPH = 0;
      let totalDO = 0;
      let totalTemp = 0;
      let totalWater = 0;

      for (const log of envLogs) {
        totalPH += log.pH;
        totalDO += log.dissolvedOxygen;
        totalTemp += log.temperature;
        totalWater += log.waterLevel;
      }

      averagePH = totalPH / envLogs.length;
      averageDO = totalDO / envLogs.length;
      averageTemperature = totalTemp / envLogs.length;
      averageWaterLevel = totalWater / envLogs.length;

      // Compute efficiencies based on averages (similar to client-side formula)
      const phScore = averagePH >= 6.5 && averagePH <= 8.5 ? 100 : Math.max(0, 100 - Math.abs(averagePH - 7.5) * 20);
      const doScore = averageDO >= 5 ? 100 : (averageDO / 5) * 100;
      const tempScore =
        averageTemperature >= 25 && averageTemperature <= 32
          ? 100
          : Math.max(0, 100 - Math.abs(averageTemperature - 28.5) * 10);
      waterEfficiency = Math.round((phScore + doScore + tempScore) / 3);

      const doFactor = Math.min(averageDO / 7, 1);
      const tempFactor =
        averageTemperature >= 26 && averageTemperature <= 30
          ? 1
          : Math.max(0.5, 1 - Math.abs(averageTemperature - 28) * 0.05);
      feedEfficiency = Math.round(doFactor * tempFactor * 100);
    }

    // 2. Fetch feeding metrics
    const feedLogs = await db
      .select()
      .from(feedingLog)
      .where(eq(feedingLog.pondId, pondId));

    const totalFeedKg = feedLogs.reduce((sum, log) => sum + log.amountKg, 0);

    // 3. Fetch latest harvest log
    const [latestHarvest] = await db
      .select()
      .from(harvestLog)
      .where(eq(harvestLog.pondId, pondId))
      .orderBy(desc(harvestLog.timestamp))
      .limit(1);

    const estimatedBiomassKg = latestHarvest ? latestHarvest.estimatedBiomassKg : 0;
    const actualYieldKg = latestHarvest ? latestHarvest.actualYieldKg : 0;

    // FCR = total feed / output weight (using actual yield if available, or estimated biomass)
    const outputWeight = actualYieldKg > 0 ? actualYieldKg : estimatedBiomassKg;
    const feedConversionRatio = outputWeight > 0 ? Math.round((totalFeedKg / outputWeight) * 100) / 100 : 0;

    return {
      pondId,
      averagePH: Math.round(averagePH * 100) / 100,
      averageDO: Math.round(averageDO * 100) / 100,
      averageTemperature: Math.round(averageTemperature * 100) / 100,
      averageWaterLevel: Math.round(averageWaterLevel * 100) / 100,
      totalFeedKg,
      estimatedBiomassKg,
      feedConversionRatio,
      waterEfficiency,
      feedEfficiency,
    };
  }
}
