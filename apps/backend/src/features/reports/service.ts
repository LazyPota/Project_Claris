import { db, eq, and, desc } from "@project-clarias/database";
import { environmentLog, feedingLog, harvestLog, pond, report } from "@project-clarias/database/schema/aquaculture";
import type { ReportInsert } from "./schema";

export class ReportService {
  static async getAll(userId: number) {
    return db
      .select()
      .from(report)
      .where(eq(report.userId, userId))
      .orderBy(desc(report.createdAt));
  }

  static async getById(id: number, userId: number) {
    const [result] = await db
      .select()
      .from(report)
      .where(and(eq(report.id, id), eq(report.userId, userId)));
    return result || null;
  }

  static async create(data: Omit<ReportInsert, "id" | "createdAt" | "userId">, userId: number) {
    const [result] = await db
      .insert(report)
      .values({
        ...data,
        userId,
      })
      .returning();
    return result;
  }

  static async generateReport(pondId: number | undefined, customName: string | undefined, userId: number) {
    // 1. Fetch relevant ponds
    const ponds = await db
      .select()
      .from(pond)
      .where(
        pondId !== undefined
          ? and(eq(pond.id, pondId), eq(pond.userId, userId))
          : eq(pond.userId, userId)
      );

    if (ponds.length === 0) {
      return null;
    }

    const pondIds = ponds.map((p) => p.id);

    // 2. Fetch feeding logs
    const feedingLogs = await db
      .select()
      .from(feedingLog)
      .innerJoin(pond, eq(feedingLog.pondId, pond.id))
      .where(
        pondId !== undefined
          ? and(eq(pond.id, pondId), eq(pond.userId, userId))
          : eq(pond.userId, userId)
      );

    const totalKg = feedingLogs.reduce((sum, item) => sum + item.feeding_log.amountKg, 0);
    const byPond: Record<string, number> = {};
    const byType: Record<string, number> = {};

    for (const item of feedingLogs) {
      const pName = item.pond.name;
      const fType = item.feeding_log.feedType;
      byPond[pName] = (byPond[pName] ?? 0) + item.feeding_log.amountKg;
      byType[fType] = (byType[fType] ?? 0) + item.feeding_log.amountKg;
    }

    const feedingSummary = { totalKg, byPond, byType };

    // 3. Fetch harvests
    const harvestLogs = await db
      .select()
      .from(harvestLog)
      .innerJoin(pond, eq(harvestLog.pondId, pond.id))
      .where(
        pondId !== undefined
          ? and(eq(pond.id, pondId), eq(pond.userId, userId))
          : eq(pond.userId, userId)
      );

    const totalEstimatedKg = harvestLogs.reduce((sum, item) => sum + item.harvest_log.estimatedBiomassKg, 0);
    const totalActualKg = harvestLogs.reduce((sum, item) => sum + item.harvest_log.actualYieldKg, 0);
    const overallYieldPercent =
      totalEstimatedKg > 0
        ? Math.round((totalActualKg / totalEstimatedKg) * 1000) / 10
        : 0;

    const harvests = harvestLogs.map((item) => ({
      date: item.harvest_log.timestamp.toISOString().split("T")[0],
      estimatedBiomassKg: item.harvest_log.estimatedBiomassKg,
      actualYieldKg: item.harvest_log.actualYieldKg,
      pondId: item.pond.name,
      species: item.harvest_log.species,
    }));

    // 4. Fetch environmental snapshots
    const envLogs = await db
      .select()
      .from(environmentLog)
      .innerJoin(pond, eq(environmentLog.pondId, pond.id))
      .where(
        pondId !== undefined
          ? and(eq(pond.id, pondId), eq(pond.userId, userId))
          : eq(pond.userId, userId)
      )
      .orderBy(desc(environmentLog.timestamp));

    // Get latest log per pond to calculate average snapshot
    const latestEnvPerPond: Record<number, typeof environmentLog.$inferSelect> = {};
    for (const log of envLogs) {
      const pId = log.environment_log.pondId;
      if (latestEnvPerPond[pId] === undefined) {
        latestEnvPerPond[pId] = log.environment_log;
      }
    }

    let averagePH = 7.0;
    let averageDO = 6.0;
    let averageTemp = 28.0;
    let averageWaterLevel = 1.0;
    let hasAlert = false;
    let waterEfficiency = 0;
    let feedEfficiency = 0;

    const latestEnvs = Object.values(latestEnvPerPond);
    if (latestEnvs.length > 0) {
      let totalPH = 0;
      let totalDO = 0;
      let totalTemp = 0;
      let totalWater = 0;

      for (const env of latestEnvs) {
        totalPH += env.pH;
        totalDO += env.dissolvedOxygen;
        totalTemp += env.temperature;
        totalWater += env.waterLevel;
        if (env.hasAlert) hasAlert = true;
      }

      averagePH = totalPH / latestEnvs.length;
      averageDO = totalDO / latestEnvs.length;
      averageTemp = totalTemp / latestEnvs.length;
      averageWaterLevel = totalWater / latestEnvs.length;

      const phScore = averagePH >= 6.5 && averagePH <= 8.5 ? 100 : Math.max(0, 100 - Math.abs(averagePH - 7.5) * 20);
      const doScore = averageDO >= 5 ? 100 : (averageDO / 5) * 100;
      const tempScore =
        averageTemp >= 25 && averageTemp <= 32
          ? 100
          : Math.max(0, 100 - Math.abs(averageTemp - 28.5) * 10);
      waterEfficiency = Math.round((phScore + doScore + tempScore) / 3);

      const doFactor = Math.min(averageDO / 7, 1);
      const tempFactor =
        averageTemp >= 26 && averageTemp <= 30
          ? 1
          : Math.max(0.5, 1 - Math.abs(averageTemp - 28) * 0.05);
      feedEfficiency = Math.round(doFactor * tempFactor * 100);
    }

    const environmentSnapshot = {
      dissolvedOxygen: Math.round(averageDO * 10) / 10,
      pH: Math.round(averagePH * 10) / 10,
      waterLevel: Math.round(averageWaterLevel * 100) / 100,
      temperature: Math.round(averageTemp * 10) / 10,
      hasAlert,
      timestamp: new Date().toISOString(),
    };

    // 5. Assemble structured JSON
    const reportContent = {
      ponds: ponds.map((p) => ({ id: p.id, name: p.name })),
      harvests,
      environment: environmentSnapshot,
      feedingSummary,
      totalEstimatedKg,
      totalActualKg,
      overallYieldPercent,
      waterEfficiency,
      feedEfficiency,
    };

    // TODO: Generate PDF document and save/upload it associated with this report instance.
    // For now, we only generate and return the structured JSON report payload.

    const reportName = customName || `Aquaculture Report - ${new Date().toLocaleString()}`;
    const [savedReport] = await db
      .insert(report)
      .values({
        name: reportName,
        type: "aquaculture",
        content: JSON.stringify(reportContent),
        userId,
      })
      .returning();

    return savedReport;
  }
}
