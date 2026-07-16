import { db, eq, and, desc } from "@project-clarias/database";
import { environmentLog, pond } from "@project-clarias/database/schema/aquaculture";
import type { EnvironmentLogInsert } from "./schema";

export class EnvironmentService {
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
      .from(environmentLog)
      .where(eq(environmentLog.pondId, pondId))
      .orderBy(desc(environmentLog.timestamp))
      .limit(limit);
  }

  static async addLog(data: Omit<EnvironmentLogInsert, "id" | "timestamp">, userId: number) {
    const isOwner = await this.verifyPondOwner(data.pondId, userId);
    if (!isOwner) return null;

    // TODO: Sensor simulation will automatically compute alert states.
    // Replace custom manual alert inputs with sensor alerts in future sensor integrations.
    const [result] = await db
      .insert(environmentLog)
      .values(data)
      .returning();
    return result;
  }
}
