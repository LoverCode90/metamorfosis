import { NextRequest, NextResponse } from "next/server"
import { createShippoClient } from "@/lib/shippo/client"
import { createAdminClient } from "@/lib/supabase/admin"

/**
 * POST /api/webhooks/shippo
 *
 * Label print keeps orders at `confirmed`. `shipped` is set only when the
 * carrier scans after a scheduled pickup (TRANSIT + pickup_status = scheduled).
 */
export async function POST(request: NextRequest) {
  const rawBody = await request.text()
  const headers = Object.fromEntries(request.headers.entries())

  const shippo = createShippoClient()
  let payload: Awaited<ReturnType<typeof shippo.validateWebhook>>

  try {
    payload = await shippo.validateWebhook({
      request: {
        body: rawBody,
        headers,
        url: request.url,
        method: "POST",
      },
    })
  } catch (err) {
    console.error("[shippo-webhook] Signature validation failed:", err)
    return NextResponse.json({ error: "Invalid signature" }, { status: 401 })
  }

  const event = (payload as { event?: string }).event
  const data = (payload as { data?: Record<string, unknown> }).data

  if (!event || !data) {
    return NextResponse.json({ received: true })
  }

  const admin = createAdminClient()

  if (event === "track_updated") {
    await handleTrackUpdated(admin, data)
  }

  if (event === "transaction_created") {
    await handleTransactionCreated(admin, data)
  }

  return NextResponse.json({ received: true })
}

async function handleTrackUpdated(
  admin: ReturnType<typeof createAdminClient>,
  data: Record<string, unknown>,
) {
  const trackData = data as {
    tracking_number?: string
    tracking_status?: { status?: string; status_date?: string }
    eta?: string
    carrier?: string
    tracking_url_provider?: string
  }

  const trackingNumber = trackData.tracking_number
  if (!trackingNumber) return

  const carrierStatus = trackData.tracking_status?.status ?? ""

  const { data: order } = await admin
    .from("orders")
    .select("id, status, pickup_status")
    .eq("tracking_number", trackingNumber)
    .maybeSingle()

  if (!order) return

  const trackingOnly: Record<string, unknown> = {}
  if (trackData.eta)
    trackingOnly.estimated_delivery_date = trackData.eta.split("T")[0]
  if (trackData.tracking_url_provider)
    trackingOnly.tracking_url = trackData.tracking_url_provider
  if (trackData.carrier) trackingOnly.carrier = trackData.carrier
  if (carrierStatus === "DELIVERED" && trackData.tracking_status?.status_date) {
    trackingOnly.delivered_at = trackData.tracking_status.status_date
  }

  const shouldMarkShipped =
    carrierStatus === "TRANSIT" && order.pickup_status === "scheduled"

  const shouldMarkDelivered = carrierStatus === "DELIVERED"

  const statusUpdate: Record<string, unknown> = { ...trackingOnly }

  if (shouldMarkShipped) {
    statusUpdate.status = "shipped"
    statusUpdate.pickup_status = "completed"
  } else if (shouldMarkDelivered) {
    statusUpdate.status = "delivered"
    if (order.pickup_status === "scheduled") {
      statusUpdate.pickup_status = "completed"
    }
  }

  if (Object.keys(statusUpdate).length === 0) return

  const { error } = await admin
    .from("orders")
    .update(statusUpdate)
    .eq("tracking_number", trackingNumber)

  if (error) {
    console.error("[shippo-webhook] track_updated DB update failed:", error)
  }
}

async function handleTransactionCreated(
  admin: ReturnType<typeof createAdminClient>,
  data: Record<string, unknown>,
) {
  const txData = data as {
    object_id?: string
    tracking_number?: string
    tracking_url_provider?: string
    metadata?: string
  }

  const transactionId = txData.object_id
  const trackingNumber = txData.tracking_number
  const orderId = txData.metadata

  if (!transactionId || !trackingNumber) return

  const updatePayload: Record<string, unknown> = {
    shippo_transaction_id: transactionId,
    tracking_number: trackingNumber,
    status: "confirmed",
    pickup_status: "unscheduled",
  }
  if (txData.tracking_url_provider) {
    updatePayload.tracking_url = txData.tracking_url_provider
  }

  try {
    const query = admin.from("orders").update(updatePayload)
    if (orderId) {
      query.eq("id", orderId)
    } else {
      query.eq("shippo_transaction_id", transactionId)
    }

    const { error } = await query
    if (error) {
      console.error(
        "[shippo-webhook] transaction_created DB update failed:",
        error,
      )
    }
  } catch (err) {
    console.error("[shippo-webhook] transaction_created DB exception:", err)
  }
}
