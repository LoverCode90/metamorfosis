import { NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"
import { loadWishlistFromDb } from "@/lib/wishlist/db"

export async function GET() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const items = await loadWishlistFromDb(user.id)
  return NextResponse.json({ items })
}
