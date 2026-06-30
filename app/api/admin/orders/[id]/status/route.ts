import { NextResponse } from "next/server"

/**
 * Manual order status changes are disabled — status is driven by Shippo
 * webhooks and label generation. Use POST /api/admin/orders/[id]/cancel for
 * admin-initiated cancellations.
 */
export async function POST() {
  return NextResponse.json(
    {
      error:
        "Manual status updates are disabled. Order status is updated automatically.",
    },
    { status: 403 },
  )
}
