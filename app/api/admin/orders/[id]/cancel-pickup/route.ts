import { NextRequest, NextResponse } from "next/server"

import { createAdminClient } from "@/lib/supabase/admin"
import { createClient } from "@/lib/supabase/server"
import { isPickupShipment } from "@/lib/admin/is-pickup-shipment"
import { cancelPickupOrder } from "@/lib/orders/cancel-pickup-order"

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const resolvedParams = await params
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const admin = createAdminClient()

  const { data: profile } = await admin
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single()

  if (profile?.role !== "admin") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 })
  }

  let reason = "Pickup order canceled by store"
  try {
    const body = await request.json()
    if (typeof body.reason === "string" && body.reason.trim()) {
      reason = body.reason.trim()
    }
  } catch {}

  const { data: order, error } = await admin
    .from("orders")
    .select(
      `id, square_order_id, status, total_cents, carrier, shipping_method, shipping_address,
      order_items ( variation_id, quantity )`,
    )
    .eq("id", resolvedParams.id)
    .single()

  if (error || !order) {
    return NextResponse.json({ error: "Order not found" }, { status: 404 })
  }

  if (!isPickupShipment(order.shipping_method, order.carrier)) {
    return NextResponse.json(
      { error: "Only in-store pickup orders can be canceled here" },
      { status: 400 },
    )
  }

  try {
    await cancelPickupOrder(admin, order, {
      adminId: user.id,
      reason,
      auditAction: "admin_cancel_pickup",
      emailReason: reason,
    })
    return NextResponse.json({ ok: true })
  } catch (err: unknown) {
    console.error("[admin-cancel-pickup]", err)
    const message =
      err instanceof Error ? err.message : "Failed to cancel pickup order"
    const status = message.includes("not eligible") ? 400 : 500
    return NextResponse.json({ error: message }, { status })
  }
}
