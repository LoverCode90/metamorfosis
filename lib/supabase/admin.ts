import "server-only"

import { createClient as createSupabaseClient } from "@supabase/supabase-js"

/**
 * Service-role Supabase client. Bypasses Row Level Security.
 *
 * SERVER-ONLY. Never import this in a Client Component. The `server-only`
 * import above turns any client-side import into a build error.
 *
 * Use exclusively in trusted server contexts (webhooks, admin tasks) where
 * RLS must be bypassed deliberately.
 */
export function createAdminClient() {
  return createSupabaseClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    },
  )
}
