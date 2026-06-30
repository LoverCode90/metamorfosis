import { NextResponse } from "next/server"

import { createClient } from "@/lib/supabase/server"
import { createAdminClient } from "@/lib/supabase/admin"
import { requireAdmin } from "@/lib/admin/require-admin"
import { getTransactionLabelUrl } from "@/lib/shippo/purchase-label"

/** Returns the Shippo label PDF URL for an order that already has a transaction. */
export async function GET(
  _req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id: orderId } = await params
    const supabase = await createClient()
    const gate = await requireAdmin(supabase)
    if (!gate.ok) {
      return NextResponse.json({ error: gate.error }, { status: gate.status })
    }

    const admin = createAdminClient()
    const { data: order, error } = await admin
      .from("orders")
      .select("id, shippo_transaction_id, tracking_number, carrier")
      .eq("id", orderId)
      .single()

    if (error || !order) {
      return NextResponse.json({ error: "Order not found" }, { status: 404 })
    }
    if (!order.shippo_transaction_id) {
      return NextResponse.json(
        { error: "No shipping label exists for this order" },
        { status: 404 },
      )
    }

    try {
      const { labelUrl, trackingNumber } = await getTransactionLabelUrl(
        order.shippo_transaction_id,
      )
      if (!labelUrl) {
        return NextResponse.json(
          { error: "Label URL is not available from Shippo" },
          { status: 502 },
        )
      }

      return NextResponse.json({
        labelUrl,
        trackingNumber: trackingNumber ?? order.tracking_number,
        carrier: order.carrier,
      })
    } catch (err: unknown) {
      const details = err instanceof Error ? err.message : String(err)
      return NextResponse.json(
        { error: "Could not fetch label", details },
        { status: 502 },
      )
    }
  } catch (error) {
    console.error("[GET /api/admin/orders/[id]/label]", error)
    return NextResponse.json(
      {
        error: "Internal Server Error",
        details: error instanceof Error ? error.message : String(error),
      },
      { status: 500 },
    )
  }
}
