import "server-only"

import { createAdminClient } from "@/lib/supabase/admin"
import type { CheckoutAddress } from "@/lib/checkout/types"

export interface DbAddress {
  id: string
  user_id: string
  label: string | null
  full_name: string
  phone_number: string
  street_line_1: string
  street_line_2: string | null
  city: string
  state: string
  zip_code: string
  country: string
  is_default: boolean
}

/**
 * Returns the user's default address, or null if none exists.
 */
export async function getDefaultAddress(
  userId: string,
): Promise<DbAddress | null> {
  const admin = createAdminClient()
  const { data } = await admin
    .from("addresses")
    .select("*")
    .eq("user_id", userId)
    .eq("is_default", true)
    .maybeSingle()
  return (data as DbAddress | null) ?? null
}

/**
 * Upserts the address from a completed checkout as the user's default.
 * Uses the address full_name + street as a natural conflict key — if the
 * exact same address already exists, updates it to is_default instead of
 * inserting a duplicate.
 */
export async function saveCheckoutAddress(
  userId: string,
  address: CheckoutAddress,
): Promise<void> {
  const admin = createAdminClient()

  // Check if this exact address already exists for the user
  const { data: existing } = await admin
    .from("addresses")
    .select("id")
    .eq("user_id", userId)
    .eq("street_line_1", address.streetLine1)
    .eq("zip_code", address.zip)
    .maybeSingle()

  if (existing) {
    // Promote to default
    await admin
      .from("addresses")
      .update({ is_default: true })
      .eq("id", existing.id)
    return
  }

  // Clear existing defaults and insert new one
  await admin
    .from("addresses")
    .update({ is_default: false })
    .eq("user_id", userId)
    .eq("is_default", true)

  await admin.from("addresses").insert({
    user_id: userId,
    full_name: address.fullName,
    phone_number: address.phone,
    street_line_1: address.streetLine1,
    street_line_2: address.streetLine2 || null,
    city: address.city,
    state: address.state,
    zip_code: address.zip,
    country: "US",
    is_default: true,
  })
}

/**
 * Deletes the user's default address row.
 */
export async function deleteDefaultAddress(userId: string): Promise<void> {
  const admin = createAdminClient()
  await admin
    .from("addresses")
    .delete()
    .eq("user_id", userId)
    .eq("is_default", true)
}

/**
 * Maps a DB address row to a CheckoutAddress for pre-filling forms.
 * The email field is not stored on the address — callers should supply it
 * from the user's profile.
 */
export function dbAddressToCheckout(
  row: DbAddress,
  email: string,
): CheckoutAddress {
  return {
    fullName: row.full_name,
    email,
    phone: row.phone_number,
    streetLine1: row.street_line_1,
    streetLine2: row.street_line_2 ?? "",
    city: row.city,
    state: row.state,
    zip: row.zip_code,
    country: "US",
  }
}
