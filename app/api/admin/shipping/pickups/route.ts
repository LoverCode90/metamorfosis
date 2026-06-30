import { NextResponse } from "next/server"
import { createAdminClient } from "@/lib/supabase/admin"
import { requireAdmin } from "@/lib/admin/require-admin"
import { createClient } from "@/lib/supabase/server"
import { createShippoClient } from "@/lib/shippo/client"
import { SHIP_FROM_ADDRESS } from "@/lib/shippo/live-rates"

export async function POST(req: Request) {
  try {
    const supabase = await createClient()
    const gate = await requireAdmin(supabase)
    if (!gate.ok) {
      return NextResponse.json({ error: gate.error }, { status: gate.status })
    }

    const body = await req.json()
    const { requestedStartTime, requestedEndTime, carrierAccountId } = body
    if (!requestedStartTime || !requestedEndTime) {
      return NextResponse.json(
        { error: "requestedStartTime and requestedEndTime are required" },
        { status: 400 },
      )
    }

    const admin = createAdminClient()
    const { data: orders, error: ordersError } = await admin
      .from("orders")
      .select("id, shippo_transaction_id, carrier")
      .in("status", ["confirmed", "shipped"])
      .not("shippo_transaction_id", "is", null)

    if (ordersError) {
      return NextResponse.json(
        { error: "Failed to fetch orders" },
        { status: 500 },
      )
    }

    if (!orders || orders.length === 0) {
      return NextResponse.json(
        { error: "No eligible orders found for pickup" },
        { status: 404 },
      )
    }

    const transactionIds = orders.map((o) => o.shippo_transaction_id as string)

    const shippo = createShippoClient()

    // We assume the frontend might pass a default carrierAccountId or we pick the first one
    const pickup = await shippo.pickups.create({
      carrierAccount:
        carrierAccountId || process.env.SHIPPO_DEFAULT_CARRIER_ACCOUNT || "",
      location: {
        buildingLocationType: "Store",
        buildingType: "commercial",
        address: {
          name: SHIP_FROM_ADDRESS.name,
          street1: SHIP_FROM_ADDRESS.street1,
          city: SHIP_FROM_ADDRESS.city,
          state: SHIP_FROM_ADDRESS.state,
          zip: SHIP_FROM_ADDRESS.zip,
          country: SHIP_FROM_ADDRESS.country,
          phone: SHIP_FROM_ADDRESS.phone,
          email: "support@metamorfosis.com",
        },
      },
      transactions: transactionIds,
      requestedStartTime,
      requestedEndTime,
      isRouting: false,
    } as any)

    return NextResponse.json({ success: true, pickup })
  } catch (err: unknown) {
    console.error("[POST /api/admin/shipping/pickups]", err)
    const errorMsg =
      err instanceof Error ? err.message : "Internal Server Error"
    return NextResponse.json({ error: errorMsg }, { status: 500 })
  }
}
