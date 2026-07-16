import type { Context } from "hono";
import type { BackendEnv } from "../../app";
import { AlertService } from "./service";

export class AlertController {
  static async getActive(c: Context<BackendEnv>) {
    const account = c.get("account");
    const alerts = await AlertService.getActiveAlerts(account.id);
    return c.json({ success: true, data: alerts });
  }
}
