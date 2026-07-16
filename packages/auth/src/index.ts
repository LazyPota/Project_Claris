import { db } from "@project-clarias/database";
import * as schema from "@project-clarias/database/schema/auth";
import { supabaseService } from "@project-clarias/database/supabase/service-server";
import { env } from "@project-clarias/env";
import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { APIError, createAuthMiddleware } from "better-auth/api";
import { nextCookies } from "better-auth/next-js";
import { userRegistration } from "./database";

export const auth = betterAuth({
  secret: env.BETTER_AUTH_SECRET || "placeholder-better-auth-secret-key-12345678",
  baseURL: env.NEXT_PUBLIC_APP_URL || "http://localhost:3000",
  database: drizzleAdapter(db, {
    provider: "pg",
    schema,
  }),
  account: {
    encryptOAuthTokens: true,
    storeStateStrategy: "database",
  },
  hooks: {
    before: createAuthMiddleware(async (ctx) => {
      if (ctx.path === "/sign-in/oauth2") {
        const { login_hint: loginHint } = ctx.body.additionalData;

        // validate login_hint thing to prevent abuse
        if (!loginHint || typeof loginHint !== "string") {
          throw new APIError("BAD_REQUEST", {
            message: "Missing or invalid login_hint",
          });
        }
      }
    }),
    after: createAuthMiddleware(async (ctx) => {
      const userId =
        ctx.context.session?.user.id || ctx.context.newSession?.user.id;

      const newSession = ctx.context.newSession;
      if (!newSession) return;

      if (ctx.path.startsWith("/oauth2/callback/")) {
        try {
          await supabaseService.rpc("set_user_id", {
            user_id: userId as string,
          });
        } catch (e) {
          console.error("Supabase identify failed", e);
        }

        try {
          await userRegistration(newSession.user);
        } catch (e) {
          console.error("User registration failed", e);
        }
      }
    }),
  },
  socialProviders: {
    google: {
      clientId: env.GOOGLE_CLIENT_ID,
      clientSecret: env.GOOGLE_CLIENT_SECRET,
    },
  },
  plugins: [
    nextCookies(),
  ],
});

export type AuthType = {
  user: typeof auth.$Infer.Session.user | null;
  session: typeof auth.$Infer.Session.session | null;
};
