import type { Context } from "hono";
import type { BackendEnv } from "../../app";
import { DashboardService } from "./service";

export class DashboardController {
  static async getOverview(c: Context<BackendEnv>) {
    const account = c.get("account");
    const overview = await DashboardService.getOverview(account.id);
    return c.json({ success: true, data: overview });
  }
}
