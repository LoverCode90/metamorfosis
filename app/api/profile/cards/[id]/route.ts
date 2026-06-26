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
    .select("id, square_card_id, is_default")
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

  // Fetch the user's remaining cards (oldest first) to reconcile state
  const { data: remaining } = await admin
    .from("saved_cards")
    .select("id")
    .eq("user_id", user.id)
    .order("created_at", { ascending: true })

  if (!remaining || remaining.length === 0) {
    // No cards left — clear the backward-compat columns on the profile
    await admin
      .from("profiles")
      .update({ square_card_id: null, square_customer_id: null })
      .eq("id", user.id)
  } else if (card.is_default) {
    // Deleted card was the default — promote the oldest remaining card
    await admin
      .from("saved_cards")
      .update({ is_default: true })
      .eq("id", remaining[0].id)
  }

  return NextResponse.json({ ok: true })
}

export async function PUT(
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

  // Verify the card belongs to the user before mutating defaults
  const { data: card } = await supabase
    .from("saved_cards")
    .select("id")
    .eq("id", id)
    .eq("user_id", user.id)
    .single()

  if (!card) {
    return NextResponse.json({ error: "Card not found" }, { status: 404 })
  }

  const admin = createAdminClient()

  // Clear default on all of the user's cards, then set it on this one
  const { error: clearError } = await admin
    .from("saved_cards")
    .update({ is_default: false })
    .eq("user_id", user.id)

  if (clearError) {
    return NextResponse.json(
      { error: "Failed to update default card" },
      { status: 500 },
    )
  }

  const { error: setError } = await admin
    .from("saved_cards")
    .update({ is_default: true })
    .eq("id", id)

  if (setError) {
    return NextResponse.json(
      { error: "Failed to update default card" },
      { status: 500 },
    )
  }

  return NextResponse.json({ ok: true })
}
