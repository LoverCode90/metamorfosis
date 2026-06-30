import { NextRequest, NextResponse } from "next/server"
import { createShippoClient } from "@/lib/shippo/client"
import { createAdminClient } from "@/lib/supabase/admin"

/**
 * POST /api/webhooks/shippo
 *
 * Receives Shippo tracking events and keeps orders.status + tracking fields
 * in sync.
 *
 * Shippo event types we care about:
 *  - track_updated → update status, tracking_url, estimated_delivery_date, delivered_at
 *  - transaction_created → a label was purchased; store tracking number
 *
 * The Shippo SDK's validateWebhook verifies the HMAC-SHA256 signature using
 * SHIPPO_WEBHOOK_SECRET so no raw body parsing gymnastics are needed.
 */
export async function POST(request: NextRequest) {
  const rawBody = await request.text()
  const headers = Object.fromEntries(request.headers.entries())

  // ── Validate signature ────────────────────────────────────────────────────
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

  // ── track_updated — update order status from carrier scan ─────────────────
  if (event === "track_updated") {
    const trackData = data as {
      tracking_number?: string
      tracking_status?: { status?: string; status_date?: string }
      eta?: string
      carrier?: string
      tracking_url_provider?: string
    }

    const trackingNumber = trackData.tracking_number
    if (!trackingNumber) return NextResponse.json({ received: true })

    const status = trackData.tracking_status?.status ?? ""
    const newOrderStatus = shippoTrackStatusToOrderStatus(status)

    const updatePayload: Record<string, unknown> = {}
    if (newOrderStatus) updatePayload.status = newOrderStatus
    if (trackData.eta)
      updatePayload.estimated_delivery_date = trackData.eta.split("T")[0]
    if (trackData.tracking_url_provider)
      updatePayload.tracking_url = trackData.tracking_url_provider
    if (trackData.carrier) updatePayload.carrier = trackData.carrier
    if (status === "DELIVERED" && trackData.tracking_status?.status_date) {
      updatePayload.delivered_at = trackData.tracking_status.status_date
    }

    if (Object.keys(updatePayload).length > 0) {
      try {
        const { error: updateError } = await admin
          .from("orders")
          .update(updatePayload)
          .eq("tracking_number", trackingNumber)

        if (updateError) {
          console.error(
            "[shippo-webhook] track_updated DB update failed:",
            updateError,
          )
        }
      } catch (dbException) {
        console.error(
          "[shippo-webhook] track_updated DB exception:",
          dbException,
        )
      }
    }
  }

  // ── transaction_created — label purchased; store tracking info ─────────────
  if (event === "transaction_created") {
    const txData = data as {
      object_id?: string
      tracking_number?: string
      tracking_url_provider?: string
      metadata?: string // we store our order UUID in metadata
    }

    const transactionId = txData.object_id
    const trackingNumber = txData.tracking_number
    const orderId = txData.metadata // set when creating the transaction

    if (transactionId && trackingNumber) {
      const updatePayload: Record<string, unknown> = {
        shippo_transaction_id: transactionId,
        tracking_number: trackingNumber,
        status: "confirmed",
      }
      if (txData.tracking_url_provider) {
        updatePayload.tracking_url = txData.tracking_url_provider
      }

      try {
        const query = admin.from("orders").update(updatePayload)
        if (orderId) {
          query.eq("id", orderId)
        } else {
          // Fall back to transaction ID match
          query.eq("shippo_transaction_id", transactionId)
        }

        const { error: transactionUpdateError } = await query
        if (transactionUpdateError) {
          console.error(
            "[shippo-webhook] transaction_created DB update failed:",
            transactionUpdateError,
          )
        }
      } catch (transactionException) {
        console.error(
          "[shippo-webhook] transaction_created DB exception:",
          transactionException,
        )
      }
    }
  }

  return NextResponse.json({ received: true })
}

function shippoTrackStatusToOrderStatus(shippoStatus: string): string | null {
  switch (shippoStatus) {
    case "PRE_TRANSIT":
    case "UNKNOWN":
      return "confirmed"
    case "TRANSIT":
      return "shipped"
    case "DELIVERED":
      return "delivered"
    case "RETURNED":
    case "FAILURE":
      return "canceled"
    default:
      return null
  }
}
