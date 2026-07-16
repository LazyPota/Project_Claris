import z from "zod";

export const getAnalyticsParamSchema = z.object({
  pondId: z.string().regex(/^\d+$/).transform(Number),
});
