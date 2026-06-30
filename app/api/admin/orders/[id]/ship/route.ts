import { NextResponse } from "next/server"

import { createClient } from "@/lib/supabase/server"
import { createAdminClient } from "@/lib/supabase/admin"
import { requireAdmin } from "@/lib/admin/require-admin"
import { isShippoTestMode } from "@/lib/shippo/env"
import { purchaseLabel } from "@/lib/shippo/purchase-label"
import { requoteOrderForLabel } from "@/lib/shippo/requote-order"
import {
  shipFromConfigErrorMessage,
  validateShipFromConfig,
} from "@/lib/shippo/ship-from"

/**
 * Re-quotes a fresh Shippo rate, purchases the label, stores tracking, and
 * marks the order shipped.
 */
export async function POST(
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

    const shipFrom = validateShipFromConfig()
    if (!shipFrom.ok) {
      return NextResponse.json(
        {
          error: shipFromConfigErrorMessage(shipFrom.missing),
          details: `Missing: ${shipFrom.missing.join(", ")}`,
        },
        { status: 503 },
      )
    }

    const admin = createAdminClient()
    const { data: order, error: orderError } = await admin
      .from("orders")
      .select("id, tracking_number")
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

    let quote
    try {
      quote = await requoteOrderForLabel(orderId)
    } catch (err: unknown) {
      const details = err instanceof Error ? err.message : String(err)
      return NextResponse.json(
        { error: "Could not get shipping rates", details },
        { status: 502 },
      )
    }

    let label
    try {
      label = await purchaseLabel(quote.rateId)
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
        status: "shipped",
        shippo_rate_id: quote.rateId,
        shippo_shipment_id: quote.shipmentId,
        shippo_transaction_id: label.transactionId,
        tracking_number: label.trackingNumber,
        tracking_url: label.trackingUrl,
        carrier: quote.carrier,
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
        status: "shipped",
        shippo_rate_id: quote.rateId,
      },
      notes: "Generated shipping label via Shippo (re-quoted rate).",
    })

    return NextResponse.json({
      success: true,
      labelUrl: label.labelUrl,
      trackingNumber: label.trackingNumber,
      carrier: quote.carrier,
      serviceName: quote.serviceName,
      shippoTestMode: isShippoTestMode(),
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
