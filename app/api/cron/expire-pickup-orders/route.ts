import { NextRequest, NextResponse } from "next/server"

import { expirePickupOrders } from "@/lib/orders/expire-pickup-orders"

export async function GET(request: NextRequest) {
  const secret = process.env.CRON_SECRET
  const authHeader = request.headers.get("authorization")

  if (!secret || authHeader !== `Bearer ${secret}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  try {
    const result = await expirePickupOrders()
    return NextResponse.json({ ok: true, ...result })
  } catch (err: unknown) {
    console.error("[cron/expire-pickup-orders]", err)
    const message = err instanceof Error ? err.message : "Cron failed"
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
