import { NextResponse } from "next/server"

import { createAdminClient } from "@/lib/supabase/admin"
import { requireAdmin } from "@/lib/admin/require-admin"
import { createClient } from "@/lib/supabase/server"
import { loadPickupScheduleData } from "@/lib/admin/load-pickup-schedule-data"
import { scheduleCarrierPickups } from "@/lib/admin/schedule-carrier-pickups"
import type { CarrierPickupSlotKey } from "@/lib/admin/pickup-slots"

const SLOT_KEYS = new Set<CarrierPickupSlotKey>(["evening", "daytime"])

export async function GET() {
  try {
    const supabase = await createClient()
    const gate = await requireAdmin(supabase)
    if (!gate.ok) {
      return NextResponse.json({ error: gate.error }, { status: gate.status })
    }

    const admin = createAdminClient()
    const data = await loadPickupScheduleData(admin)
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

    if (!SLOT_KEYS.has(slotKey)) {
      return NextResponse.json({ error: "Invalid slotKey" }, { status: 400 })
    }
    if (!/^\d{4}-\d{2}-\d{2}$/.test(pickupDate)) {
      return NextResponse.json(
        { error: "pickupDate is required" },
        { status: 400 },
      )
    }

    const admin = createAdminClient()
    const result = await scheduleCarrierPickups({
      admin,
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
