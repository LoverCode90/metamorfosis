import { NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"
import { removeCartItem } from "@/lib/cart/db"

/**
 * DELETE /api/cart/remove
 * Remove one item from the authenticated user's Supabase cart.
 * Body: { variationId: string }
 */
export async function DELETE(request: NextRequest) {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const { variationId } = (await request.json()) as { variationId: string }

  if (!variationId) {
    return NextResponse.json({ error: "Invalid payload" }, { status: 400 })
  }

  await removeCartItem(user.id, variationId)
  return NextResponse.json({ ok: true })
}
