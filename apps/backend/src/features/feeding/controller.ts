import type { Context } from "hono";
import type { z } from "zod";
import type { BackendEnv } from "../../app";
import { FeedingService } from "./service";
import type { addFeedingLogSchema, getFeedingLogsQuerySchema } from "./validation";

export class FeedingController {
  static async getLogs(c: Context<BackendEnv>) {
    const account = c.get("account");
    const { pondId, limit } = c.req.valid("query" as never) as z.infer<typeof getFeedingLogsQuerySchema>;
    const logs = await FeedingService.getLogs(pondId, account.id, limit);
    if (logs === null) {
      return c.json({ success: false, message: "Pond not found or unauthorized" }, 404);
    }
    return c.json({ success: true, data: logs });
  }

  static async create(c: Context<BackendEnv>) {
    const account = c.get("account");
    const body = c.req.valid("json" as never) as z.infer<typeof addFeedingLogSchema>;
    const result = await FeedingService.addLog(body, account.id);
    if (result === null) {
      return c.json({ success: false, message: "Pond not found or unauthorized" }, 404);
    }
    return c.json({ success: true, data: result });
  }
}
