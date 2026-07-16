import { integer, pgEnum, pgTable, text, timestamp } from "drizzle-orm/pg-core";
import { account } from "./user";

export const projectTypeEnum = pgEnum("project_type", ["game", "tool", "other"]);

export const project = pgTable("project", {
  id: integer("id").primaryKey().generatedAlwaysAsIdentity(),
  userId: integer("user_id").notNull().references(() => account.id),
  type: projectTypeEnum("type").notNull().default("other"),
  name: text("name").notNull(),
  description: text("description").notNull(),
  codeUrl: text("code_url"),
  playableUrl: text("playable_url"),
  imageUrl: text("image_url"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});
