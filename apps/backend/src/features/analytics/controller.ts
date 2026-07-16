import type { Context } from "hono";
import type { z } from "zod";
import type { BackendEnv } from "../../app";
import { AnalyticsService } from "./service";
import type { getAnalyticsParamSchema } from "./validation";

export class AnalyticsController {
  static async getAnalytics(c: Context<BackendEnv>) {
    const account = c.get("account");
    const { pondId } = c.req.valid("param" as never) as z.infer<typeof getAnalyticsParamSchema>;
    const analytics = await AnalyticsService.getAnalytics(pondId, account.id);
    if (!analytics) {
      return c.json({ success: false, message: "Pond not found or unauthorized" }, 404);
    }
    return c.json({ success: true, data: analytics });
  }
}
