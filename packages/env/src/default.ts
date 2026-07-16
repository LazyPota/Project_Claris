import { createEnv } from "@t3-oss/env-nextjs";
import * as z from "zod";

export const env = createEnv({
  skipValidation: !!process.env.SKIP_ENV_VALIDATION,
  server: {
    // Next.js
    ANALYZE: z.string().min(1),

    // Database
    SUPABASE_DATABASE_SECRET_KEY: z.string().min(1),
    SUPABASE_DATABASE_DIRECT_IPV6: z.string().min(1),
    SUPABASE_DATABASE_TRANSACTION_POOLER: z.string().min(1),
    SUPABASE_DATABASE_SESSION_POOLER_NOT_RECOMMENDED: z.string().min(1),

    // Auth
    BETTER_AUTH_SECRET: z.string().min(1),
    GOOGLE_CLIENT_ID: z.string().min(1),
    GOOGLE_CLIENT_SECRET: z.string().min(1),
  },
  client: {
    // Next.js
    NEXT_PUBLIC_APP_URL: z.url().min(1),

    // Supabase (client)
    NEXT_PUBLIC_SUPABASE_URL: z.url(),
    NEXT_PUBLIC_SUPABASE_PUBLISHABLE_DEFAULT_KEY: z.string().min(1),

    // Vercel-provided system vars
    NEXT_PUBLIC_VERCEL_ENV: z
      .enum(["production", "preview", "development"])
      .optional(),
    NEXT_PUBLIC_VERCEL_TARGET_ENV: z.string().min(1).optional(),
    NEXT_PUBLIC_VERCEL_URL: z.string().optional(),
    NEXT_PUBLIC_VERCEL_BRANCH_URL: z.string().optional(),
    NEXT_PUBLIC_VERCEL_PROJECT_PRODUCTION_URL: z.string().min(1).optional(),
    NEXT_PUBLIC_VERCEL_REGION: z.string().min(1).optional(),
    NEXT_PUBLIC_VERCEL_DEPLOYMENT_ID: z.string().min(1).optional(),
    NEXT_PUBLIC_VERCEL_PROJECT_ID: z.string().min(1).optional(),

    // Vercel-provided git metadata
    NEXT_PUBLIC_VERCEL_GIT_PROVIDER: z
      .enum(["github", "gitlab", "bitbucket"])
      .optional(),
    NEXT_PUBLIC_VERCEL_GIT_REPO_SLUG: z.string().min(1).optional(),
    NEXT_PUBLIC_VERCEL_GIT_REPO_OWNER: z.string().min(1).optional(),
    NEXT_PUBLIC_VERCEL_GIT_REPO_ID: z.string().min(1).optional(),
    NEXT_PUBLIC_VERCEL_GIT_COMMIT_REF: z.string().min(1).optional(),
    NEXT_PUBLIC_VERCEL_GIT_COMMIT_SHA: z.string().min(1).optional(),
    NEXT_PUBLIC_VERCEL_GIT_COMMIT_MESSAGE: z.string().min(1).optional(),
    NEXT_PUBLIC_VERCEL_GIT_COMMIT_AUTHOR_LOGIN: z.string().min(1).optional(),
    NEXT_PUBLIC_VERCEL_GIT_COMMIT_AUTHOR_NAME: z.string().min(1).optional(),
    NEXT_PUBLIC_VERCEL_GIT_PREVIOUS_SHA: z.string().optional(),
    NEXT_PUBLIC_VERCEL_GIT_PULL_REQUEST_ID: z.string().optional(),
  },
  // biome-ignore format: you fucked up at formatting ts shi
  experimental__runtimeEnv: {
    NEXT_PUBLIC_APP_URL:                            (process.env.NEXT_PUBLIC_APP_URL || process.env.VERCEL_URL || "http://localhost:3000").replace(/\/$/, ''),
    NEXT_PUBLIC_SUPABASE_URL:                       process.env.NEXT_PUBLIC_SUPABASE_URL,
    NEXT_PUBLIC_SUPABASE_PUBLISHABLE_DEFAULT_KEY:   process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_DEFAULT_KEY,
    NEXT_PUBLIC_VERCEL_ENV:                         process.env.NEXT_PUBLIC_VERCEL_ENV,
    NEXT_PUBLIC_VERCEL_TARGET_ENV:                  process.env.NEXT_PUBLIC_VERCEL_TARGET_ENV,
    NEXT_PUBLIC_VERCEL_URL:                         process.env.NEXT_PUBLIC_VERCEL_URL,
    NEXT_PUBLIC_VERCEL_BRANCH_URL:                  process.env.NEXT_PUBLIC_VERCEL_BRANCH_URL,
    NEXT_PUBLIC_VERCEL_PROJECT_PRODUCTION_URL:      process.env.NEXT_PUBLIC_VERCEL_PROJECT_PRODUCTION_URL,
    NEXT_PUBLIC_VERCEL_REGION:                      process.env.NEXT_PUBLIC_VERCEL_REGION,
    NEXT_PUBLIC_VERCEL_DEPLOYMENT_ID:               process.env.NEXT_PUBLIC_VERCEL_DEPLOYMENT_ID,
    NEXT_PUBLIC_VERCEL_PROJECT_ID:                  process.env.NEXT_PUBLIC_VERCEL_PROJECT_ID,
    NEXT_PUBLIC_VERCEL_GIT_PROVIDER:                process.env.NEXT_PUBLIC_VERCEL_GIT_PROVIDER,
    NEXT_PUBLIC_VERCEL_GIT_REPO_SLUG:               process.env.NEXT_PUBLIC_VERCEL_GIT_REPO_SLUG,
    NEXT_PUBLIC_VERCEL_GIT_REPO_OWNER:              process.env.NEXT_PUBLIC_VERCEL_GIT_REPO_OWNER,
    NEXT_PUBLIC_VERCEL_GIT_REPO_ID:                 process.env.NEXT_PUBLIC_VERCEL_GIT_REPO_ID,
    NEXT_PUBLIC_VERCEL_GIT_COMMIT_REF:              process.env.NEXT_PUBLIC_VERCEL_GIT_COMMIT_REF,
    NEXT_PUBLIC_VERCEL_GIT_COMMIT_SHA:              process.env.NEXT_PUBLIC_VERCEL_GIT_COMMIT_SHA,
    NEXT_PUBLIC_VERCEL_GIT_COMMIT_MESSAGE:          process.env.NEXT_PUBLIC_VERCEL_GIT_COMMIT_MESSAGE,
    NEXT_PUBLIC_VERCEL_GIT_COMMIT_AUTHOR_LOGIN:     process.env.NEXT_PUBLIC_VERCEL_GIT_COMMIT_AUTHOR_LOGIN,
    NEXT_PUBLIC_VERCEL_GIT_COMMIT_AUTHOR_NAME:      process.env.NEXT_PUBLIC_VERCEL_GIT_COMMIT_AUTHOR_NAME,
    NEXT_PUBLIC_VERCEL_GIT_PREVIOUS_SHA:            process.env.NEXT_PUBLIC_VERCEL_GIT_PREVIOUS_SHA,
    NEXT_PUBLIC_VERCEL_GIT_PULL_REQUEST_ID:         process.env.NEXT_PUBLIC_VERCEL_GIT_PULL_REQUEST_ID,
  },
});
