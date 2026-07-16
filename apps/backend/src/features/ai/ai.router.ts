import { zValidator } from "@hono/zod-validator";
import { authMiddleware } from "../../../lib/auth";
import { HonoApp } from "../../app";
import { AIController } from "./ai.controller";
import {
  chatInputSchema,
  dashboardInputSchema,
  recommendationsInputSchema,
  explainChartInputSchema,
  dailySummaryInputSchema,
} from "./ai.schema";

/**
 * Hono router for Project Clarias AI endpoints.
 */
export const aiRouter = HonoApp()
  .get("/health", AIController.health)
  .get("/test", AIController.test)
  .post("/chat", authMiddleware(), zValidator("json", chatInputSchema), AIController.chat)
  .post("/dashboard-summary", authMiddleware(), zValidator("json", dashboardInputSchema), AIController.dashboardSummary)
  .post("/recommendations", authMiddleware(), zValidator("json", recommendationsInputSchema), AIController.recommendations)
  .post("/explain-chart", authMiddleware(), zValidator("json", explainChartInputSchema), AIController.explainChart)
  .post("/daily-summary", authMiddleware(), zValidator("json", dailySummaryInputSchema), AIController.dailySummary);
