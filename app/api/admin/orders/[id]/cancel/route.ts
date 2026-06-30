import { NextRequest, NextResponse } from "next/server"
import { createAdminClient } from "@/lib/supabase/admin"
import { createClient } from "@/lib/supabase/server"
import { refundOrder } from "@/lib/square/refund"
import { sendOrderCanceled } from "@/lib/email/order-status-emails"

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

  let reason = "Admin cancelled order"
  try {
    const body = await request.json()
    if (body.reason) reason = body.reason
  } catch {}

  const { data: order, error } = await admin
    .from("orders")
    .select("*")
    .eq("id", resolvedParams.id)
    .single()

  if (error || !order) {
    return NextResponse.json({ error: "Order not found" }, { status: 404 })
  }

  if (
    order.status === "shipped" ||
    order.status === "delivered" ||
    order.status === "canceled" ||
    order.status === "refunded"
  ) {
    return NextResponse.json(
      { error: "Order cannot be cancelled at this stage" },
      { status: 400 },
    )
  }

  try {
    const isLegacyTestOrder = order.square_order_id?.startsWith("test-")
    if (order.square_order_id && !isLegacyTestOrder) {
      await refundOrder(order.square_order_id, order.total_cents, reason)
    }

    await admin
      .from("orders")
      .update({ status: "canceled" })
      .eq("id", resolvedParams.id)

    await admin.from("audit_logs").insert({
      admin_id: user.id,
      action: "admin_cancel_order",
      target_table: "orders",
      target_id: resolvedParams.id,
      new_value: { status: "canceled" },
      notes: reason,
    })

    const customerEmail = order.shipping_address?.email as string | undefined
    const customerName =
      (order.shipping_address?.fullName as string | undefined) ?? "there"
    const normalizedReason =
      reason !== "Admin cancelled order" ? reason : undefined

    if (customerEmail) {
      await sendOrderCanceled({
        to: customerEmail,
        customerName,
        orderNumber: order.square_order_id,
        reason: normalizedReason,
      }).catch((err) =>
        console.error("[admin-cancel-order] email failed:", err),
      )
    }

    return NextResponse.json({ ok: true })
  } catch (err: unknown) {
    console.error("[admin-cancel-order]", err)
    const e = err as { errors?: { detail?: string }[]; message?: string }
    const errorMsg =
      e?.errors?.[0]?.detail || e?.message || "Failed to cancel order"
    return NextResponse.json({ error: errorMsg }, { status: 500 })
  }
}
