import type { Context } from "hono";
import { HardwareStatusService } from "./service";
import type { HeartbeatPayload } from "./validation";

export class StatusController {
  static getHardwareStatus(c: Context) {
    const result = HardwareStatusService.getStatus();
    return c.json({ success: true, data: result });
  }

  static postHeartbeat(c: Context) {
    const body = c.req.valid("json" as never) as HeartbeatPayload;
    HardwareStatusService.recordHeartbeat(body.serialConnected, body.rawPayload);
    return c.json({ success: true });
  }

  static postDisconnect(c: Context) {
    HardwareStatusService.recordDisconnect();
    return c.json({ success: true });
  }
}
