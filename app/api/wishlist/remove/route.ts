import { NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"
import { removeFromWishlistDb } from "@/lib/wishlist/db"

export async function DELETE(request: NextRequest) {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const { productId, variationId } = (await request.json()) as {
    productId: string
    variationId?: string
  }

  if (!productId)
    return NextResponse.json({ error: "Invalid payload" }, { status: 400 })

  await removeFromWishlistDb(user.id, productId, variationId)
  return NextResponse.json({ ok: true })
}
