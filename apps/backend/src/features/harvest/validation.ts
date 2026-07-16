import z from "zod";

export const addHarvestLogSchema = z.object({
  pondId: z.number().int().positive(),
  species: z.string().min(1, "Species is required"),
  estimatedBiomassKg: z.number().positive(),
  actualYieldKg: z.number().positive(),
});

export const getHarvestLogsQuerySchema = z.object({
  pondId: z.string().regex(/^\d+$/).transform(Number),
  limit: z.string().regex(/^\d+$/).transform(Number).optional().default(50),
});
