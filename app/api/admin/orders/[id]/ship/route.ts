import { NextResponse } from "next/server"

import { createClient } from "@/lib/supabase/server"
import { createAdminClient } from "@/lib/supabase/admin"
import { requireAdmin } from "@/lib/admin/require-admin"
import { purchaseLabel } from "@/lib/shippo/purchase-label"

/**
 * Generates the shipping label for an order via Shippo transaction.create using
 * the saved `shippo_rate_id`, then stores the tracking info and marks the order
 * as shipped.
 */
export async function POST(
  req: Request,
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
    const { data: order, error: orderError } = await admin
      .from("orders")
      .select("id, shippo_rate_id, tracking_number, carrier")
      .eq("id", orderId)
      .single()

    if (orderError || !order) {
      return NextResponse.json({ error: "Order not found" }, { status: 404 })
    }
    if (order.tracking_number) {
      return NextResponse.json(
        { error: "A label has already been generated for this order" },
        { status: 400 },
      )
    }
    if (!order.shippo_rate_id) {
      return NextResponse.json(
        {
          error:
            "No saved Shippo rate for this order (was it in-store pickup?)",
        },
        { status: 400 },
      )
    }

    let label
    try {
      label = await purchaseLabel(order.shippo_rate_id)
    } catch (err: unknown) {
      const details = err instanceof Error ? err.message : String(err)
      return NextResponse.json(
        { error: "Label generation failed", details },
        { status: 502 },
      )
    }

    const { error: updateError } = await admin
      .from("orders")
      .update({
        status: "confirmed",
        shippo_transaction_id: label.transactionId,
        tracking_number: label.trackingNumber,
        tracking_url: label.trackingUrl,
      })
      .eq("id", orderId)

    if (updateError) {
      return NextResponse.json(
        { error: "Label bought but failed to save tracking" },
        { status: 500 },
      )
    }

    await admin.from("audit_logs").insert({
      admin_id: gate.userId,
      action: "order_label_generated",
      target_table: "orders",
      target_id: orderId,
      new_value: {
        tracking_number: label.trackingNumber,
        status: "confirmed",
      },
      notes: "Generated shipping label via Shippo.",
    })

    return NextResponse.json({
      success: true,
      trackingNumber: label.trackingNumber,
      labelUrl: label.labelUrl,
    })
  } catch (error) {
    console.error("[POST /api/admin/orders/[id]/ship]", error)
    return NextResponse.json(
      {
        error: "Internal Server Error",
        details: error instanceof Error ? error.message : String(error),
      },
      { status: 500 },
    )
  }
}
