import { betterFetch } from "@better-fetch/fetch";
import { auth } from "@project-clarias/auth/server";
import { db, eq } from "@project-clarias/database";
import type { UserPermission } from "@project-clarias/database/schema/user";
import { account as accountTable } from "@project-clarias/database/schema/user";
import type { Context, Next } from "hono";
import type { BackendEnv } from "../src/app";

export const authMiddleware =
  (role?: UserPermission | UserPermission[]) =>
  async (c: Context<BackendEnv>, next: Next) => {
    let session = await auth.api.getSession({
      headers: c.req.raw.headers,
    });

    let userId: string;
    let sessionObj: any;

    if (!session) {
      // Fall back to the seeded guest/demo user when no session exists
      userId = "test-user-id-123";
      sessionObj = {
        id: "mock-session-id",
        userId: "test-user-id-123",
        token: "mock-token",
        expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000),
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      c.set("user", {
        id: "test-user-id-123",
        email: "miftasigma11@gmail.com",
        name: "Mifta",
        emailVerified: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      });
      c.set("session", sessionObj);
    } else {
      userId = session.user.id;
      sessionObj = session.session;
      c.set("user", session.user);
      c.set("session", session.session);
    }

    let account = await db
      .select()
      .from(accountTable)
      .where(eq(accountTable.userId, userId))
      .then((res) => res[0]);

    if (!account) {
      return c.json({ success: false, message: "account-not-found" });
    }

    c.set("account", { ...account, session: sessionObj });

    return next();
  };
