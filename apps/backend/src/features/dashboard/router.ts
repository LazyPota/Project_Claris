import { authMiddleware } from "../../../lib/auth";
import { HonoApp } from "../../app";
import { DashboardController } from "./controller";

export const dashboardRouter = HonoApp()
  .get("/", authMiddleware(), DashboardController.getOverview);
