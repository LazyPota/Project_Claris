import { db, eq, and, desc } from "@project-clarias/database";
import { harvestLog, pond } from "@project-clarias/database/schema/aquaculture";
import type { HarvestLogInsert } from "./schema";

export class HarvestService {
  static async verifyPondOwner(pondId: number, userId: number): Promise<boolean> {
    const [result] = await db
      .select({ id: pond.id })
      .from(pond)
      .where(and(eq(pond.id, pondId), eq(pond.userId, userId)));
    return !!result;
  }

  static async getLogs(pondId: number, userId: number, limit: number) {
    const isOwner = await this.verifyPondOwner(pondId, userId);
    if (!isOwner) return null;

    return db
      .select()
      .from(harvestLog)
      .where(eq(harvestLog.pondId, pondId))
      .orderBy(desc(harvestLog.timestamp))
      .limit(limit);
  }

  static async addLog(data: Omit<HarvestLogInsert, "id" | "timestamp">, userId: number) {
    const isOwner = await this.verifyPondOwner(data.pondId, userId);
    if (!isOwner) return null;

    // TODO: Biomass prediction and sensor tracking can be simulated/calculated here.
    const [result] = await db
      .insert(harvestLog)
      .values(data)
      .returning();
    return result;
  }
}
