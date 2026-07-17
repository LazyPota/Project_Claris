import { zValidator } from "@hono/zod-validator";
import { HonoApp } from "../../app";
import { StatusController } from "./controller";
import { heartbeatSchema } from "./validation";

export const statusRouter = HonoApp()
  .get("/hardware", StatusController.getHardwareStatus)
  .post("/hardware/heartbeat", zValidator("json", heartbeatSchema), StatusController.postHeartbeat)
  .post("/hardware/disconnect", StatusController.postDisconnect);
