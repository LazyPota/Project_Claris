import { z } from "zod";

export const heartbeatSchema = z.object({
  serialConnected: z.boolean(),
  lastDataTimestamp: z.string(),
  rawPayload: z.string().optional(),
});

export type HeartbeatPayload = z.infer<typeof heartbeatSchema>;
