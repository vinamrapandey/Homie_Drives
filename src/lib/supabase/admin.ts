import { createClient } from "@supabase/supabase-js";

/**
 * Supabase Admin Client
 * Uses SUPABASE_SERVICE_ROLE_KEY to perform privileged operations (e.g. migrations, seeding, audit logging).
 * CRITICAL RULE: Never import or call this on the client side or in public components.
 */
export function createAdminClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "https://ppcdpxpjoabbuctnvnko.supabase.co";
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!serviceRoleKey) {
    throw new Error(
      "SUPABASE_SERVICE_ROLE_KEY is required for administrative operations but is not defined in the environment."
    );
  }

  return createClient(supabaseUrl, serviceRoleKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });
}

