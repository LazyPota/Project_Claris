import { zValidator } from "@hono/zod-validator";
import { authMiddleware } from "../../../lib/auth";
import { HonoApp } from "../../app";
import { ReportController } from "./controller";
import { createReportSchema, generateReportBodySchema, reportIdParamSchema } from "./validation";

export const reportsRouter = HonoApp()
  .get("/", authMiddleware(), ReportController.getAll)
  .get("/:id", authMiddleware(), zValidator("param", reportIdParamSchema), ReportController.getById)
  .post("/", authMiddleware(), zValidator("json", createReportSchema), ReportController.create)
  .post("/generate", authMiddleware(), zValidator("json", generateReportBodySchema), ReportController.generate);
