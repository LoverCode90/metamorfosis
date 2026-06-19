import { NextRequest, NextResponse } from "next/server"
import { validateSquareSignature } from "@/lib/square/webhook"
import { runFullCatalogSync } from "@/lib/square/sync"

/**
 * Square webhook receiver.
 * Square fires `catalog.version.updated` on any catalog change.
 *
 * Security: HMAC-SHA256 signature verified before any processing.
 * Returns 200 immediately and runs the sync asynchronously.
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

  return NextResponse.json({ ok: true })
}
