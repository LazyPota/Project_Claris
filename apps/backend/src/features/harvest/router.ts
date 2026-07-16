import { zValidator } from "@hono/zod-validator";
import { authMiddleware } from "../../../lib/auth";
import { HonoApp } from "../../app";
import { HarvestController } from "./controller";
import { addHarvestLogSchema, getHarvestLogsQuerySchema } from "./validation";

export const harvestRouter = HonoApp()
  .get("/", authMiddleware(), zValidator("query", getHarvestLogsQuerySchema), HarvestController.getLogs)
  .post("/", authMiddleware(), zValidator("json", addHarvestLogSchema), HarvestController.create);
