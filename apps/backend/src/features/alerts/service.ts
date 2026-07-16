import { db, eq, and, desc } from "@project-clarias/database";
import { environmentLog, pond } from "@project-clarias/database/schema/aquaculture";

export class AlertService {
  static async getActiveAlerts(userId: number) {
    // Select latest environment readings that have hasAlert = true for ponds owned by the user.
    // To do this properly, we join pond with environmentLog.
    const alerts = await db
      .select({
        id: environmentLog.id,
        pondId: environmentLog.pondId,
        pondName: pond.name,
        dissolvedOxygen: environmentLog.dissolvedOxygen,
        pH: environmentLog.pH,
        waterLevel: environmentLog.waterLevel,
        temperature: environmentLog.temperature,
        hasAlert: environmentLog.hasAlert,
        timestamp: environmentLog.timestamp,
      })
      .from(environmentLog)
      .innerJoin(pond, eq(environmentLog.pondId, pond.id))
      .where(and(eq(pond.userId, userId), eq(environmentLog.hasAlert, true)))
      .orderBy(desc(environmentLog.timestamp));
    return alerts;
  }
}
