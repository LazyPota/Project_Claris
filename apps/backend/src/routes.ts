import { adminUserRouter } from "./admin/users";
import { HonoApp } from "./app";
import { authRouter } from "./auth";
import { dashboardRouter } from "./features/dashboard/router";
import { pondsRouter } from "./features/ponds/router";
import { environmentRouter } from "./features/environment/router";
import { feedingRouter } from "./features/feeding/router";
import { harvestRouter } from "./features/harvest/router";
import { analyticsRouter } from "./features/analytics/router";
import { reportsRouter } from "./features/reports/router";
import { alertsRouter } from "./features/alerts/router";
import { meRouter } from "./me";
import { userRouter } from "./user";

export const router = HonoApp()
  .route("/auth", authRouter)
  .route("/user", userRouter)
  .route("/admin/users", adminUserRouter)
  .route("/me", meRouter)
  .route("/dashboard", dashboardRouter)
  .route("/ponds", pondsRouter)
  .route("/environment", environmentRouter)
  .route("/feeding", feedingRouter)
  .route("/harvest", harvestRouter)
  .route("/analytics", analyticsRouter)
  .route("/reports", reportsRouter)
  .route("/alerts", alertsRouter);
export type RouterRoutes = typeof router;
