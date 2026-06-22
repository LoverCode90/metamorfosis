import { type NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"
import {
  getDefaultAddress,
  dbAddressToCheckout,
  saveCheckoutAddress,
} from "@/lib/addresses/db"
import type { CheckoutAddress } from "@/lib/checkout/types"

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

/**
 * POST /api/addresses/default
 * Saves a CheckoutAddress as the authenticated user's default shipping address.
 * Called on checkout step-advance and from the profile address form.
 * Fire-and-forget on the client — failures are non-blocking.
 */
export async function POST(request: NextRequest): Promise<NextResponse> {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  let body: unknown
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: "Invalid request body" }, { status: 400 })
  }

  const addr = body as Partial<CheckoutAddress>
  if (
    !addr.fullName ||
    !addr.streetLine1 ||
    !addr.city ||
    !addr.state ||
    !addr.zip
  ) {
    return NextResponse.json({ error: "Incomplete address" }, { status: 422 })
  }

  await saveCheckoutAddress(user.id, {
    fullName: addr.fullName,
    email: addr.email ?? "",
    phone: addr.phone ?? "",
    streetLine1: addr.streetLine1,
    streetLine2: addr.streetLine2 ?? "",
    city: addr.city,
    state: addr.state,
    zip: addr.zip,
    country: "US",
  })

  return NextResponse.json({ ok: true })
}
