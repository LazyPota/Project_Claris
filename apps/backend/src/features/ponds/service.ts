import { db, eq, and } from "@project-clarias/database";
import { pond } from "@project-clarias/database/schema/aquaculture";

export class PondService {
  static async getAll(userId: number) {
    return db.select().from(pond).where(eq(pond.userId, userId));
  }

  static async getById(id: number, userId: number) {
    const [result] = await db
      .select()
      .from(pond)
      .where(and(eq(pond.id, id), eq(pond.userId, userId)));
    return result || null;
  }

  static async create(name: string, userId: number) {
    const [result] = await db
      .insert(pond)
      .values({ name, userId })
      .returning();
    return result;
  }

  static async update(id: number, name: string, userId: number) {
    const [result] = await db
      .update(pond)
      .set({ name })
      .where(and(eq(pond.id, id), eq(pond.userId, userId)))
      .returning();
    return result || null;
  }

  static async delete(id: number, userId: number) {
    const [result] = await db
      .delete(pond)
      .where(and(eq(pond.id, id), eq(pond.userId, userId)))
      .returning();
    return result || null;
  }
}
