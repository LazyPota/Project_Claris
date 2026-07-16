import type { pond } from "@project-clarias/database/schema/aquaculture";

export type PondSelect = typeof pond.$inferSelect;
export type PondInsert = typeof pond.$inferInsert;
