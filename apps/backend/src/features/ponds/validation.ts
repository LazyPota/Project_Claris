import z from "zod";

export const createPondSchema = z.object({
  name: z.string().min(1, "Name is required"),
});

export const updatePondSchema = z.object({
  name: z.string().min(1, "Name is required"),
});

export const pondIdParamSchema = z.object({
  id: z.string().regex(/^\d+$/).transform(Number),
});
