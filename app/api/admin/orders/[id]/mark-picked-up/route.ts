import { NextRequest, NextResponse } from "next/server"

import { createAdminClient } from "@/lib/supabase/admin"
import { createClient } from "@/lib/supabase/server"
import { isPickupShipment } from "@/lib/admin/is-pickup-shipment"

export async function POST(
  _request: NextRequest,
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

  const { data: order, error } = await admin
    .from("orders")
    .select("id, status, carrier, shipping_method")
    .eq("id", resolvedParams.id)
    .single()

  if (error || !order) {
    return NextResponse.json({ error: "Order not found" }, { status: 404 })
  }

  if (!isPickupShipment(order.shipping_method, order.carrier)) {
    return NextResponse.json(
      { error: "Only in-store pickup orders can be marked as picked up" },
      { status: 400 },
    )
  }

  if (order.status === "delivered") {
    return NextResponse.json({ ok: true })
  }

  if (order.status === "canceled" || order.status === "refunded") {
    return NextResponse.json(
      { error: "Cannot mark a canceled order as picked up" },
      { status: 400 },
    )
  }

  const pickedUpAt = new Date().toISOString()

  await admin
    .from("orders")
    .update({ status: "delivered", picked_up_at: pickedUpAt })
    .eq("id", resolvedParams.id)

  await admin.from("audit_logs").insert({
    admin_id: user.id,
    action: "mark_pickup_collected",
    target_table: "orders",
    target_id: resolvedParams.id,
    new_value: { status: "delivered", picked_up_at: pickedUpAt },
  })

  return NextResponse.json({ ok: true })
}
