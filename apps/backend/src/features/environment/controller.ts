import type { Context } from "hono";
import type { z } from "zod";
import type { BackendEnv } from "../../app";
import { EnvironmentService } from "./service";
import type { addEnvironmentLogSchema, getEnvironmentLogsQuerySchema } from "./validation";

export class EnvironmentController {
  static async getLogs(c: Context<BackendEnv>) {
    const account = c.get("account");
    const { pondId, limit } = c.req.valid("query" as never) as z.infer<typeof getEnvironmentLogsQuerySchema>;
    const logs = await EnvironmentService.getLogs(pondId, account.id, limit);
    if (logs === null) {
      return c.json({ success: false, message: "Pond not found or unauthorized" }, 404);
    }
    return c.json({ success: true, data: logs });
  }

  static async create(c: Context<BackendEnv>) {
    const account = c.get("account");
    const body = c.req.valid("json" as never) as z.infer<typeof addEnvironmentLogSchema>;
    const result = await EnvironmentService.addLog(body, account.id);
    if (result === null) {
      return c.json({ success: false, message: "Pond not found or unauthorized" }, 404);
    }
    return c.json({ success: true, data: result });
  }
}
