import "server-only"

import type { User } from "@supabase/supabase-js"
import type { createClient } from "@/lib/supabase/server"
import type { DbVerificationStatus, UserRole } from "@/lib/types"

type ServerClient = Awaited<ReturnType<typeof createClient>>

export interface CheckoutCustomer {
  user: User | null
  role: UserRole
  verificationStatus: DbVerificationStatus
  squareCustomerId: string | null
  squareCardId: string | null
}

/** Resolves the authenticated buyer and their role / Square customer ids. */
export async function resolveCheckoutCustomer(
  supabase: ServerClient,
): Promise<CheckoutCustomer> {
  const {
    data: { user },
  } = await supabase.auth.getUser()

  const customer: CheckoutCustomer = {
    user,
    role: "standard_customer",
    verificationStatus: "not_applicable",
    squareCustomerId: null,
    squareCardId: null,
  }
  if (!user) return customer

  const { data: profile } = await supabase
    .from("profiles")
    .select("role, verification_status, square_customer_id, square_card_id")
    .eq("id", user.id)
    .single()

  if (profile) {
    customer.role = profile.role as UserRole
    customer.verificationStatus =
      profile.verification_status as DbVerificationStatus
    customer.squareCustomerId = profile.square_customer_id as string | null
    customer.squareCardId = profile.square_card_id as string | null
  }
  return customer
}
