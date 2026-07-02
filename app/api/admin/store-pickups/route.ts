import { NextRequest, NextResponse } from "next/server"

import {
  fetchCanceledStorePickupsPage,
  fetchHistoryStorePickupsPage,
  fetchPendingStorePickupsPage,
} from "@/lib/admin/fetch-store-pickups"
import type { StorePickupTab } from "@/lib/admin/store-pickup-types"
import { createClient } from "@/lib/supabase/server"

const VALID_TABS: StorePickupTab[] = ["pending", "canceled", "history"]

/**
 * GET /api/admin/store-pickups
 *
 * Query params:
 *   tab    — "pending" | "canceled" | "history"
 *   cursor — composite pagination cursor from the previous page
 */
export async function GET(request: NextRequest): Promise<NextResponse> {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single()

  if (profile?.role !== "admin") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 })
  }

  const { searchParams } = new URL(request.url)
  const tab = searchParams.get("tab") as StorePickupTab | null
  const cursor = searchParams.get("cursor") ?? undefined

  if (!tab || !VALID_TABS.includes(tab)) {
    return NextResponse.json({ error: "Invalid tab" }, { status: 400 })
  }

  const page =
    tab === "pending"
      ? await fetchPendingStorePickupsPage(undefined, cursor)
      : tab === "canceled"
        ? await fetchCanceledStorePickupsPage(undefined, cursor)
        : await fetchHistoryStorePickupsPage(undefined, cursor)

  return NextResponse.json(page)
}
