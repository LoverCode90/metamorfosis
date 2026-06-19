import { NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"
import { mergeGuestCart, loadCartFromDb } from "@/lib/cart/db"

/**
 * POST /api/cart/sync
 * Merges guest localStorage cart into the authenticated user's Supabase cart.
 * Called once on login.
 * Body: { items: { variationId: string; quantity: number }[] }
 */
export async function POST(request: NextRequest) {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const { items } = (await request.json()) as {
    items: { variationId: string; quantity: number }[]
  }

  if (Array.isArray(items) && items.length > 0) {
    await mergeGuestCart(user.id, items)
  }

  const merged = await loadCartFromDb(user.id)
  return NextResponse.json({ items: merged })
}
