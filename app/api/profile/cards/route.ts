import { NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"
import { createAdminClient } from "@/lib/supabase/admin"
import { retrieveCardMetadata } from "@/lib/square/payments"

const CARD_SELECT =
  "id, brand, last_four, exp_month, exp_year, is_default, created_at, square_card_id"

export async function GET() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const { data: cards, error } = await supabase
    .from("saved_cards")
    .select(CARD_SELECT)
    .eq("user_id", user.id)
    .order("is_default", { ascending: false })
    .order("created_at", { ascending: false })
    .limit(1)

  if (error) {
    return NextResponse.json(
      { error: "Failed to fetch cards" },
      { status: 500 },
    )
  }

  // Backfill: card was saved before the saved_cards table existed
  if (cards.length === 0) {
    const { data: profile } = await supabase
      .from("profiles")
      .select("square_card_id, square_customer_id")
      .eq("id", user.id)
      .single()

    if (profile?.square_card_id && profile.square_customer_id) {
      const meta = await retrieveCardMetadata(profile.square_card_id)
      if (meta) {
        const admin = createAdminClient()
        const { data: inserted } = await admin
          .from("saved_cards")
          .insert({
            user_id: user.id,
            square_card_id: profile.square_card_id,
            square_customer_id: profile.square_customer_id,
            brand: meta.brand,
            last_four: meta.last4,
            exp_month: meta.expMonth,
            exp_year: meta.expYear,
            // Backfill only runs when the user has no saved cards yet
            is_default: true,
          })
          .select(CARD_SELECT)
          .single()

        return NextResponse.json({ cards: inserted ? [inserted] : [] })
      }
    }
  }

  return NextResponse.json({ cards })
}
