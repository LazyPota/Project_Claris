import { zValidator } from "@hono/zod-validator";
import { authMiddleware } from "../../../lib/auth";
import { HonoApp } from "../../app";
import { EnvironmentController } from "./controller";
import { addEnvironmentLogSchema, getEnvironmentLogsQuerySchema } from "./validation";

export const environmentRouter = HonoApp()
  .get("/", authMiddleware(), zValidator("query", getEnvironmentLogsQuerySchema), EnvironmentController.getLogs)
  .post("/", authMiddleware(), zValidator("json", addEnvironmentLogSchema), EnvironmentController.create);
