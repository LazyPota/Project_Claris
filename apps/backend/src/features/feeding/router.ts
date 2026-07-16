import { zValidator } from "@hono/zod-validator";
import { authMiddleware } from "../../../lib/auth";
import { HonoApp } from "../../app";
import { FeedingController } from "./controller";
import { addFeedingLogSchema, getFeedingLogsQuerySchema } from "./validation";

export const feedingRouter = HonoApp()
  .get("/", authMiddleware(), zValidator("query", getFeedingLogsQuerySchema), FeedingController.getLogs)
  .post("/", authMiddleware(), zValidator("json", addFeedingLogSchema), FeedingController.create);
