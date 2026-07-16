import { env } from "@project-clarias/env";
import type { Database } from "@project-clarias/shared/types/database";
import { createClient } from "@supabase/supabase-js";

/**
 * WARNING: DON'T USE THIS ON CLIENT COMPONENTS
 *
 * Creates a Supabase client with service role privileges that bypasses RLS.
 * This client should NEVER be used on the client side or exposed to users.
 */
export const createServiceServer = () => {
  const url = env.NEXT_PUBLIC_SUPABASE_URL || "https://placeholder.supabase.co";
  const key = env.SUPABASE_DATABASE_SECRET_KEY || "placeholder-key";
  return createClient<Database>(
    url,
    key,
    {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
      global: {
        headers: {
          Authorization: `Bearer ${key}`,
        },
      },
    },
  );
};

/**
 * WARNING: DON'T USE THIS ON CLIENT COMPONENTS
 *
 * Creates a Supabase client with service role privileges that bypasses RLS.
 * This client should NEVER be used on the client side or exposed to users.
 */
export const supabaseService = createServiceServer();
