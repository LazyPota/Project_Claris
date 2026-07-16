import { authMiddleware } from "../../../lib/auth";
import { HonoApp } from "../../app";
import { AlertController } from "./controller";

export const alertsRouter = HonoApp()
  .get("/", authMiddleware(), AlertController.getActive);
