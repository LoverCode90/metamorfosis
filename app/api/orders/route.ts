import { NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"
import { getUserOrdersPage } from "@/lib/orders/queries"

const PAGE_SIZE = 10

export async function GET(request: NextRequest) {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const { searchParams } = new URL(request.url)
  const offset = Math.max(0, Number(searchParams.get("offset") ?? 0))
  const limit = Math.min(
    PAGE_SIZE,
    Math.max(1, Number(searchParams.get("limit") ?? PAGE_SIZE)),
  )

  const { orders, total } = await getUserOrdersPage(user.id, limit, offset)
  const hasMore = offset + orders.length < total

  return NextResponse.json({ orders, hasMore })
}
