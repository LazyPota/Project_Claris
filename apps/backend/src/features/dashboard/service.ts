import { db, eq, and, desc, gte } from "@project-clarias/database";
import { environmentLog, feedingLog, harvestLog, pond } from "@project-clarias/database/schema/aquaculture";
import type { DashboardOverview } from "./schema";

export class DashboardService {
  static async getOverview(userId: number): Promise<DashboardOverview> {
    // 1. Fetch user's ponds
    const ponds = await db
      .select()
      .from(pond)
      .where(eq(pond.userId, userId));

    if (ponds.length === 0) {
      return {
        ponds: [],
        latestEnvironment: null,
        biomass: 0,
        harvestPrediction: 0,
        feedToday: 0,
        alerts: [],
        waterEfficiency: 0,
      };
    }

    const pondIds = ponds.map((p) => p.id);

    // 2. Fetch latest environment log across all user's ponds
    const [latestEnv] = await db
      .select({
        dissolvedOxygen: environmentLog.dissolvedOxygen,
        pH: environmentLog.pH,
        waterLevel: environmentLog.waterLevel,
        temperature: environmentLog.temperature,
        hasAlert: environmentLog.hasAlert,
        timestamp: environmentLog.timestamp,
      })
      .from(environmentLog)
      .innerJoin(pond, eq(environmentLog.pondId, pond.id))
      .where(eq(pond.userId, userId))
      .orderBy(desc(environmentLog.timestamp))
      .limit(1);

    const latestEnvironment = latestEnv
      ? {
          dissolvedOxygen: latestEnv.dissolvedOxygen,
          pH: latestEnv.pH,
          waterLevel: latestEnv.waterLevel,
          temperature: latestEnv.temperature,
          hasAlert: latestEnv.hasAlert,
          timestamp: latestEnv.timestamp.toISOString(),
        }
      : null;

    // 3. Fetch biomass (sum of estimated biomass of latest harvest logs per pond)
    const harvestLogs = await db
      .select()
      .from(harvestLog)
      .innerJoin(pond, eq(harvestLog.pondId, pond.id))
      .where(eq(pond.userId, userId))
      .orderBy(desc(harvestLog.timestamp));

    const latestHarvestPerPond: Record<number, number> = {};
    for (const log of harvestLogs) {
      const pId = log.harvest_log.pondId;
      if (latestHarvestPerPond[pId] === undefined) {
        latestHarvestPerPond[pId] = log.harvest_log.estimatedBiomassKg;
      }
    }
    const biomass = Object.values(latestHarvestPerPond).reduce((sum, val) => sum + val, 0);

    // 4. Calculate harvest prediction (linear regression on historical harvests)
    const sortedHarvests = [...harvestLogs]
      .map((h) => h.harvest_log)
      .sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime());

    const biomassValues = sortedHarvests.map((r) => r.estimatedBiomassKg);
    const predictNext = (values: number[]): number => {
      const n = values.length;
      if (n < 2) return values[0] ?? 0;
      let sumX = 0;
      let sumY = 0;
      let sumXY = 0;
      let sumX2 = 0;
      for (let i = 0; i < n; i++) {
        sumX += i;
        sumY += values[i];
        sumXY += i * values[i];
        sumX2 += i * i;
      }
      const denom = n * sumX2 - sumX * sumX;
      if (denom === 0) return sumY / n;
      const slope = (n * sumXY - sumX * sumY) / denom;
      const intercept = (sumY - slope * sumX) / n;
      return Math.round(Math.max(0, slope * n + intercept));
    };
    const harvestPrediction = predictNext(biomassValues);

    // 5. Fetch feed logged today (timestamp >= start of today in UTC)
    const startOfToday = new Date();
    startOfToday.setUTCHours(0, 0, 0, 0);

    const feedLogsToday = await db
      .select({ amountKg: feedingLog.amountKg })
      .from(feedingLog)
      .innerJoin(pond, eq(feedingLog.pondId, pond.id))
      .where(
        and(
          eq(pond.userId, userId),
          gte(feedingLog.timestamp, startOfToday)
        )
      );

    const feedToday = feedLogsToday.reduce((sum, log) => sum + log.amountKg, 0);

    // 6. Fetch active alerts (where hasAlert is true)
    const activeAlerts = await db
      .select({
        id: environmentLog.id,
        pondId: environmentLog.pondId,
        pondName: pond.name,
        dissolvedOxygen: environmentLog.dissolvedOxygen,
        pH: environmentLog.pH,
        waterLevel: environmentLog.waterLevel,
        temperature: environmentLog.temperature,
        timestamp: environmentLog.timestamp,
      })
      .from(environmentLog)
      .innerJoin(pond, eq(environmentLog.pondId, pond.id))
      .where(
        and(
          eq(pond.userId, userId),
          eq(environmentLog.hasAlert, true)
        )
      )
      .orderBy(desc(environmentLog.timestamp));

    const alerts = activeAlerts.map((a) => ({
      id: a.id,
      pondId: a.pondId,
      pondName: a.pondName,
      dissolvedOxygen: a.dissolvedOxygen,
      pH: a.pH,
      waterLevel: a.waterLevel,
      temperature: a.temperature,
      timestamp: a.timestamp.toISOString(),
    }));

    // 7. Fetch water efficiency (average water efficiency across all ponds based on latest readings)
    const envLogs = await db
      .select()
      .from(environmentLog)
      .innerJoin(pond, eq(environmentLog.pondId, pond.id))
      .where(eq(pond.userId, userId))
      .orderBy(desc(environmentLog.timestamp));

    const latestEnvPerPond: Record<number, typeof environmentLog.$inferSelect> = {};
    for (const log of envLogs) {
      const pId = log.environment_log.pondId;
      if (latestEnvPerPond[pId] === undefined) {
        latestEnvPerPond[pId] = log.environment_log;
      }
    }

    let totalWaterEfficiency = 0;
    let pondsCountWithData = 0;
    for (const env of Object.values(latestEnvPerPond)) {
      const phScore = env.pH >= 6.5 && env.pH <= 8.5 ? 100 : Math.max(0, 100 - Math.abs(env.pH - 7.5) * 20);
      const doScore = env.dissolvedOxygen >= 5 ? 100 : (env.dissolvedOxygen / 5) * 100;
      const tempScore =
        env.temperature >= 25 && env.temperature <= 32
          ? 100
          : Math.max(0, 100 - Math.abs(env.temperature - 28.5) * 10);
      const efficiency = (phScore + doScore + tempScore) / 3;
      totalWaterEfficiency += efficiency;
      pondsCountWithData++;
    }
    const waterEfficiency = pondsCountWithData > 0 ? Math.round(totalWaterEfficiency / pondsCountWithData) : 0;

    return {
      ponds,
      latestEnvironment,
      biomass: Math.round(biomass * 100) / 100,
      harvestPrediction,
      feedToday: Math.round(feedToday * 100) / 100,
      alerts,
      waterEfficiency,
    };
  }
}
