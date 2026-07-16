import { zValidator } from "@hono/zod-validator";
import { db, eq } from "@project-clarias/database";
import { logUser } from "@project-clarias/database/schema/audit-log";
import { account } from "@project-clarias/database/schema/user";
import type { UserInfo } from "@project-clarias/database/types/user.d";
import z from "zod";
import { authMiddleware } from "../../lib/auth";
import { HonoApp } from "../app";

export const adminUserRouter = HonoApp()
  .get("/", authMiddleware("admin"), async (c) => {
    const users = (await db.select().from(account)).sort((a, b) => a.id - b.id);
    return c.json({ success: true, users });
  })
  .get(
    "/:id",
    authMiddleware("admin"),
    zValidator(
      "param",
      z.object({
        id: z.string().regex(/^\d+$/).transform(Number),
      }),
    ),
    async (c) => {
      const { id } = c.req.valid("param");
      const userData = await db
        .select()
        .from(account)
        .where(eq(account.id, id))
        .then(([user]) => user);
      const logData = await db
        .select()
        .from(logUser)
        .where(eq(logUser.userId, id))
        .catch(() => []);

      if (!userData) {
        return c.json({ success: false, message: "User not found" }, 404);
      }

      return c.json({
        success: true,
        user: {
          ...userData,
          logs: logData.sort(
            (a, b) =>
              new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
          ),
        } satisfies UserInfo,
      });
    },
  )
  .patch(
    "/:id",
    authMiddleware("admin"),
    zValidator(
      "param",
      z.object({
        id: z.string().regex(/^\d+$/).transform(Number),
      }),
    ),
    zValidator(
      "json",
      z.object({
        name: z.string().optional(),
        shards: z.number().optional(),
        permissions: z
          .array(z.enum(["member", "reviewer", "fulfillment", "admin"]))
          .optional(),
      }),
    ),
    async (c) => {
      const body = c.req.valid("json");
      const { id } = c.req.valid("param");

      const updatedUser = await db
        .update(account)
        .set({
          displayName: body.name,
          shards: body.shards,
          permissions: body.permissions,
        })
        .where(eq(account.id, id))
        .returning()
        .then(([user]) => user);

      return c.json({ success: true, user: updatedUser });
    },
  );
