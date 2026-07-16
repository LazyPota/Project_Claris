import { db, eq, and, desc } from "@project-clarias/database";
import { feedingLog, pond } from "@project-clarias/database/schema/aquaculture";
import type { FeedingLogInsert } from "./schema";

export class FeedingService {
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
      .from(feedingLog)
      .where(eq(feedingLog.pondId, pondId))
      .orderBy(desc(feedingLog.timestamp))
      .limit(limit);
  }

  static async addLog(data: Omit<FeedingLogInsert, "id" | "timestamp">, userId: number) {
    const isOwner = await this.verifyPondOwner(data.pondId, userId);
    if (!isOwner) return null;

    // TODO: In future sensor/automatic feeding integration, feeding amounts can be tracked from automatic feeders.
    const [result] = await db
      .insert(feedingLog)
      .values(data)
      .returning();
    return result;
  }
}
