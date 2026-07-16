import z from "zod";

export const addFeedingLogSchema = z.object({
  pondId: z.number().int().positive(),
  feedType: z.string().min(1, "Feed type is required"),
  amountKg: z.number().positive(),
});

export const getFeedingLogsQuerySchema = z.object({
  pondId: z.string().regex(/^\d+$/).transform(Number),
  limit: z.string().regex(/^\d+$/).transform(Number).optional().default(50),
});
