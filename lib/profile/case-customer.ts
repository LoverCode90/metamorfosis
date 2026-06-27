import "server-only"

import type { SupabaseClient } from "@supabase/supabase-js"

export interface CaseCustomer {
  email: string | null
  name: string
}

/** Fetches the email + display name of a case's customer for notifications. */
export async function getCaseCustomer(
  admin: SupabaseClient,
  customerId: string,
): Promise<CaseCustomer> {
  const { data } = await admin
    .from("profiles")
    .select("email, full_name")
    .eq("id", customerId)
    .single()

  return { email: data?.email ?? null, name: data?.full_name ?? "there" }
}
