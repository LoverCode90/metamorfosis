import { NextRequest, NextResponse } from "next/server"

import { createAdminClient } from "@/lib/supabase/admin"
import { requireAdmin } from "@/lib/admin/require-admin"
import { createClient } from "@/lib/supabase/server"
import { fetchPickupTabData } from "@/lib/admin/fetch-pickup-orders"
import { scheduleCarrierPickups } from "@/lib/admin/schedule-carrier-pickups"
import type { PickupPageTab } from "@/lib/admin/carrier-pickup-types"
import type { CarrierPickupSlotKey } from "@/lib/admin/pickup-slots"

const TABS = new Set<PickupPageTab>(["ready", "scheduled", "history"])
const SLOT_KEYS = new Set<CarrierPickupSlotKey>(["evening", "daytime"])

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient()
    const gate = await requireAdmin(supabase)
    if (!gate.ok) {
      return NextResponse.json({ error: gate.error }, { status: gate.status })
    }

    const params = request.nextUrl.searchParams
    const tab = (params.get("tab") ?? "ready") as PickupPageTab
    const offset = Math.max(0, Number(params.get("offset")) || 0)
    const limit = Math.min(50, Math.max(1, Number(params.get("limit")) || 10))

    if (!TABS.has(tab)) {
      return NextResponse.json({ error: "Invalid tab" }, { status: 400 })
    }

    const admin = createAdminClient()
    const data = await fetchPickupTabData(admin, tab, offset, limit)
    return NextResponse.json(data)
  } catch (err: unknown) {
    console.error("[GET /api/admin/shipping/pickups]", err)
    const message = err instanceof Error ? err.message : "Internal Server Error"
    return NextResponse.json({ error: message }, { status: 500 })
  }
}

export async function POST(req: Request) {
  try {
    const supabase = await createClient()
    const gate = await requireAdmin(supabase)
    if (!gate.ok) {
      return NextResponse.json({ error: gate.error }, { status: gate.status })
    }

    const body = await req.json()
    const slotKey = body.slotKey as CarrierPickupSlotKey
    const pickupDate = String(body.pickupDate ?? "").trim()
    const instructions =
      typeof body.instructions === "string" ? body.instructions : undefined
    const orderIds = Array.isArray(body.orderIds)
      ? body.orderIds.filter((id: unknown) => typeof id === "string")
      : []

    if (!SLOT_KEYS.has(slotKey)) {
      return NextResponse.json({ error: "Invalid slotKey" }, { status: 400 })
    }
    if (!/^\d{4}-\d{2}-\d{2}$/.test(pickupDate)) {
      return NextResponse.json(
        { error: "pickupDate is required" },
        { status: 400 },
      )
    }
    if (orderIds.length === 0) {
      return NextResponse.json(
        { error: "Select at least one package" },
        { status: 400 },
      )
    }

    const admin = createAdminClient()
    const result = await scheduleCarrierPickups({
      admin,
      orderIds,
      slotKey,
      pickupDate,
      instructions,
    })

    return NextResponse.json(result)
  } catch (err: unknown) {
    console.error("[POST /api/admin/shipping/pickups]", err)
    const message = err instanceof Error ? err.message : "Internal Server Error"
    const status = message.includes("No eligible") ? 404 : 500
    return NextResponse.json({ error: message }, { status })
  }
}
