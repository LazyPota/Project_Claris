import z from "zod";

export const addEnvironmentLogSchema = z.object({
  pondId: z.number().int().positive(),
  dissolvedOxygen: z.number().min(0),
  pH: z.number().min(0).max(14),
  waterLevel: z.number().min(0),
  temperature: z.number().min(-50).max(100),
  hasAlert: z.boolean().optional().default(false),
});

export const getEnvironmentLogsQuerySchema = z.object({
  pondId: z.string().regex(/^\d+$/).transform(Number),
  limit: z.string().regex(/^\d+$/).transform(Number).optional().default(50),
});
