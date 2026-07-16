import { relations } from "drizzle-orm";
import { boolean, integer, pgTable, real, text, timestamp } from "drizzle-orm/pg-core";
import { account } from "./user";

export const pond = pgTable("pond", {
  id: integer("id").primaryKey().generatedAlwaysAsIdentity(),
  name: text("name").notNull(),
  userId: integer("user_id")
    .notNull()
    .references(() => account.id),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at")
    .defaultNow()
    .notNull()
    .$onUpdate(() => new Date()),
});

export const environmentLog = pgTable("environment_log", {
  id: integer("id").primaryKey().generatedAlwaysAsIdentity(),
  pondId: integer("pond_id")
    .notNull()
    .references(() => pond.id, { onDelete: "cascade" }),
  dissolvedOxygen: real("dissolved_oxygen").notNull(),
  pH: real("ph").notNull(),
  waterLevel: real("water_level").notNull(),
  temperature: real("temperature").notNull(),
  hasAlert: boolean("has_alert").default(false).notNull(),
  timestamp: timestamp("timestamp").defaultNow().notNull(),
});

export const feedingLog = pgTable("feeding_log", {
  id: integer("id").primaryKey().generatedAlwaysAsIdentity(),
  pondId: integer("pond_id")
    .notNull()
    .references(() => pond.id, { onDelete: "cascade" }),
  feedType: text("feed_type").notNull(),
  amountKg: real("amount_kg").notNull(),
  timestamp: timestamp("timestamp").defaultNow().notNull(),
});

export const harvestLog = pgTable("harvest_log", {
  id: integer("id").primaryKey().generatedAlwaysAsIdentity(),
  pondId: integer("pond_id")
    .notNull()
    .references(() => pond.id, { onDelete: "cascade" }),
  species: text("species").notNull(),
  estimatedBiomassKg: real("estimated_biomass_kg").notNull(),
  actualYieldKg: real("actual_yield_kg").notNull(),
  timestamp: timestamp("timestamp").defaultNow().notNull(),
});

export const report = pgTable("report", {
  id: integer("id").primaryKey().generatedAlwaysAsIdentity(),
  userId: integer("user_id")
    .notNull()
    .references(() => account.id),
  name: text("name").notNull(),
  type: text("type").notNull(),
  content: text("content"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// Relationships
export const pondRelations = relations(pond, ({ many, one }) => ({
  environmentLogs: many(environmentLog),
  feedingLogs: many(feedingLog),
  harvestLogs: many(harvestLog),
  user: one(account, {
    fields: [pond.userId],
    references: [account.id],
  }),
}));

export const environmentLogRelations = relations(environmentLog, ({ one }) => ({
  pond: one(pond, {
    fields: [environmentLog.pondId],
    references: [pond.id],
  }),
}));

export const feedingLogRelations = relations(feedingLog, ({ one }) => ({
  pond: one(pond, {
    fields: [feedingLog.pondId],
    references: [pond.id],
  }),
}));

export const harvestLogRelations = relations(harvestLog, ({ one }) => ({
  pond: one(pond, {
    fields: [harvestLog.pondId],
    references: [pond.id],
  }),
}));

export const reportRelations = relations(report, ({ one }) => ({
  user: one(account, {
    fields: [report.userId],
    references: [account.id],
  }),
}));
