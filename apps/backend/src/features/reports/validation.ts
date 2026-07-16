import z from "zod";

export const createReportSchema = z.object({
  name: z.string().min(1, "Report name is required"),
  type: z.string().min(1, "Report type is required"),
  content: z.string().optional(),
});

export const reportIdParamSchema = z.object({
  id: z.string().regex(/^\d+$/).transform(Number),
});

export const generateReportBodySchema = z.object({
  name: z.string().optional(),
  pondId: z.number().int().positive().optional(),
});
