import { env } from "@project-clarias/env";
import { client } from "@project-clarias/rpc";
import { createBrowserClient } from "@supabase/ssr";

export const rpc = client;

export const supabase = createBrowserClient(
  env.NEXT_PUBLIC_SUPABASE_URL || "https://placeholder.supabase.co",
  env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_DEFAULT_KEY || "placeholder-key",
);
