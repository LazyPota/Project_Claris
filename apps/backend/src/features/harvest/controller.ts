import type { Context } from "hono";
import type { z } from "zod";
import type { BackendEnv } from "../../app";
import { HarvestService } from "./service";
import type { addHarvestLogSchema, getHarvestLogsQuerySchema } from "./validation";

export class HarvestController {
  static async getLogs(c: Context<BackendEnv>) {
    const account = c.get("account");
    const { pondId, limit } = c.req.valid("query" as never) as z.infer<typeof getHarvestLogsQuerySchema>;
    const logs = await HarvestService.getLogs(pondId, account.id, limit);
    if (logs === null) {
      return c.json({ success: false, message: "Pond not found or unauthorized" }, 404);
    }
    return c.json({ success: true, data: logs });
  }

  static async create(c: Context<BackendEnv>) {
    const account = c.get("account");
    const body = c.req.valid("json" as never) as z.infer<typeof addHarvestLogSchema>;
    const result = await HarvestService.addLog(body, account.id);
    if (result === null) {
      return c.json({ success: false, message: "Pond not found or unauthorized" }, 404);
    }
    return c.json({ success: true, data: result });
  }
}
