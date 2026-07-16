import { client } from "@project-clarias/rpc";
import { createBrowserClient } from "@supabase/ssr";

export const rpc = client;

export const supabase = createBrowserClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL || "https://placeholder.supabase.co",
  process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_DEFAULT_KEY || "placeholder-key",
);
