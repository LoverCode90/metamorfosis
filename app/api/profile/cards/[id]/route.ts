import { NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"
import { createAdminClient } from "@/lib/supabase/admin"
import { disableCard } from "@/lib/square/payments"

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const { id } = await params

  // Fetch the row first to verify ownership and get the Square card ID
  const { data: card } = await supabase
    .from("saved_cards")
    .select("id, square_card_id")
    .eq("id", id)
    .eq("user_id", user.id)
    .single()

  if (!card) {
    return NextResponse.json({ error: "Card not found" }, { status: 404 })
  }

  // Disable in Square (log failure but don't block — remove locally regardless)
  const disabled = await disableCard(card.square_card_id)
  if (!disabled) {
    console.error(
      "[DELETE /api/profile/cards] Square disable failed for",
      card.square_card_id,
    )
  }

  const admin = createAdminClient()
  const { error } = await admin.from("saved_cards").delete().eq("id", id)

  if (error) {
    return NextResponse.json(
      { error: "Failed to delete card" },
      { status: 500 },
    )
  }

  return NextResponse.json({ ok: true })
}
