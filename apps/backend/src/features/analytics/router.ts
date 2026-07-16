import { zValidator } from "@hono/zod-validator";
import { authMiddleware } from "../../../lib/auth";
import { HonoApp } from "../../app";
import { AnalyticsController } from "./controller";
import { getAnalyticsParamSchema } from "./validation";

export const analyticsRouter = HonoApp()
  .get("/:pondId", authMiddleware(), zValidator("param", getAnalyticsParamSchema), AnalyticsController.getAnalytics);
