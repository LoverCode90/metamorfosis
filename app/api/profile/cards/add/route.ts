import { NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"
import { createAdminClient } from "@/lib/supabase/admin"
import {
  getOrCreateCustomer,
  createCardOnFile,
  retrieveCardMetadata,
} from "@/lib/square/payments"

export async function POST(request: NextRequest) {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const { nonce } = (await request.json()) as { nonce?: string }
  if (!nonce) {
    return NextResponse.json({ error: "Missing card token" }, { status: 400 })
  }

  // Fetch profile (full name + any existing Square customer) and current count
  const { data: profile } = await supabase
    .from("profiles")
    .select("full_name, square_customer_id")
    .eq("id", user.id)
    .single()

  const { count } = await supabase
    .from("saved_cards")
    .select("id", { count: "exact", head: true })
    .eq("user_id", user.id)

  // Enforce the 3-card limit before creating anything in Square
  if ((count ?? 0) >= 3) {
    return NextResponse.json({ error: "Max 3 cards" }, { status: 400 })
  }

  const customerId =
    profile?.square_customer_id ??
    (await getOrCreateCustomer(
      user.id,
      user.email ?? "",
      profile?.full_name ?? "",
    ))

  if (!customerId) {
    return NextResponse.json(
      { error: "Could not create payment profile" },
      { status: 502 },
    )
  }

  const cardId = await createCardOnFile(nonce, customerId)
  if (!cardId) {
    return NextResponse.json({ error: "Failed to save card" }, { status: 502 })
  }

  const meta = await retrieveCardMetadata(cardId)
  if (!meta) {
    return NextResponse.json(
      { error: "Failed to read card details" },
      { status: 502 },
    )
  }

  const admin = createAdminClient()

  const { error: insertError } = await admin.from("saved_cards").insert({
    user_id: user.id,
    square_card_id: cardId,
    square_customer_id: customerId,
    brand: meta.brand,
    last_four: meta.last4,
    exp_month: meta.expMonth,
    exp_year: meta.expYear,
    is_default: (count ?? 0) === 0,
  })

  if (insertError) {
    return NextResponse.json({ error: "Failed to save card" }, { status: 500 })
  }

  // Keep profiles in sync for backward compat (mirrors validate-payment)
  await admin
    .from("profiles")
    .update({ square_customer_id: customerId, square_card_id: cardId })
    .eq("id", user.id)

  return NextResponse.json({ ok: true })
}
