import { zValidator } from "@hono/zod-validator";
import { authMiddleware } from "../../../lib/auth";
import { HonoApp } from "../../app";
import { PondController } from "./controller";
import { createPondSchema, pondIdParamSchema, updatePondSchema } from "./validation";

export const pondsRouter = HonoApp()
  .get("/", authMiddleware(), PondController.getAll)
  .get("/:id", authMiddleware(), zValidator("param", pondIdParamSchema), PondController.getById)
  .post("/", authMiddleware(), zValidator("json", createPondSchema), PondController.create)
  .patch("/:id", authMiddleware(), zValidator("param", pondIdParamSchema), zValidator("json", updatePondSchema), PondController.update)
  .delete("/:id", authMiddleware(), zValidator("param", pondIdParamSchema), PondController.delete);
