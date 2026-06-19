import { NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"
import { getDefaultAddress, dbAddressToCheckout } from "@/lib/addresses/db"

/**
 * GET /api/addresses/default
 * Returns the authenticated user's default address as a CheckoutAddress,
 * or null if none exists. Used by the checkout info step to pre-fill fields.
 */
export async function GET() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ address: null })
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("email")
    .eq("id", user.id)
    .single()

  const saved = await getDefaultAddress(user.id)
  if (!saved) {
    return NextResponse.json({ address: null })
  }

  const address = dbAddressToCheckout(saved, profile?.email ?? user.email ?? "")
  return NextResponse.json({ address })
}
