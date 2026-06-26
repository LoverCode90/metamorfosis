import { NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"

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
    .select(
      "id, brand, last_four, exp_month, exp_year, is_default, created_at, square_card_id",
    )
    .eq("user_id", user.id)
    .order("created_at", { ascending: false })
    .limit(3)

  if (error) {
    return NextResponse.json(
      { error: "Failed to fetch cards" },
      { status: 500 },
    )
  }

  return NextResponse.json({ cards })
}
