import { NextRequest, NextResponse } from "next/server"
import { validateSquareSignature } from "@/lib/square/webhook"
import { runFullCatalogSync } from "@/lib/square/sync"
import { handleInventoryCountUpdated } from "@/lib/square/inventory-webhook"

/**
 * Square webhook receiver.
 * Subscribed events:
 * - `catalog.version.updated` — full catalog sync
 * - `inventory.count.updated` — refresh Supabase stock counts
 *
 * Security: HMAC-SHA256 signature verified before any processing.
 * Returns 200 immediately and runs handlers asynchronously.
 */
export async function POST(request: NextRequest) {
  const rawBody = await request.text()
  const signature = request.headers.get("x-square-hmacsha256-signature")
  const key = process.env.SQUARE_WEBHOOK_SIGNATURE_KEY

  if (!key) {
    console.error("[Square webhook] SQUARE_WEBHOOK_SIGNATURE_KEY not set")
    return NextResponse.json(
      { error: "Webhook not configured" },
      { status: 500 },
    )
  }

  if (!validateSquareSignature(rawBody, signature, key)) {
    return new NextResponse(null, { status: 403 })
  }

  let event: { type?: string } = {}
  try {
    event = JSON.parse(rawBody) as { type?: string }
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 })
  }

  if (event.type === "catalog.version.updated") {
    // Run async — respond 200 immediately so Square doesn't retry
    runFullCatalogSync().catch((err: unknown) => {
      console.error("[Square webhook] Catalog sync failed:", err)
    })
  }

  if (event.type === "inventory.count.updated") {
    handleInventoryCountUpdated(
      event as Parameters<typeof handleInventoryCountUpdated>[0],
    ).catch((err: unknown) => {
      console.error("[Square webhook] Inventory sync failed:", err)
    })
  }

  return NextResponse.json({ ok: true })
}
