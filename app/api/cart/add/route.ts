import { NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"
import { upsertCartItem } from "@/lib/cart/db"

/**
 * POST /api/cart/add
 * Upsert one item into the authenticated user's Supabase cart.
 * Body: { variationId: string; quantity: number }
 */
export async function POST(request: NextRequest) {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const { variationId, quantity } = (await request.json()) as {
    variationId: string
    quantity: number
  }

  if (!variationId || typeof quantity !== "number" || quantity < 1) {
    return NextResponse.json({ error: "Invalid payload" }, { status: 400 })
  }

  await upsertCartItem(user.id, variationId, quantity)
  return NextResponse.json({ ok: true })
}
