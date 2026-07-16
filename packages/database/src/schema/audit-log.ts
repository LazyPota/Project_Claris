import { integer, pgTable, text, timestamp } from "drizzle-orm/pg-core";
import { account } from "./user";

export const logUser = pgTable("audit_log", {
  id: integer("id").primaryKey().generatedAlwaysAsIdentity(),
  userId: integer("user_id").notNull().references(() => account.id),
  action: text("action").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});
