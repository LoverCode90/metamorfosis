import { NextRequest, NextResponse } from "next/server"
import { revalidatePath } from "next/cache"
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

  const { data: order, error } = await admin
    .from("orders")
    .select("*, cases(id)")
    .eq("id", resolvedParams.id)
    .eq("user_id", user.id)
    .single()

  if (error || !order) {
    return NextResponse.json({ error: "Order not found" }, { status: 404 })
  }

  const orderTime = new Date(order.created_at).getTime()
  if (Date.now() - orderTime > 2 * 60 * 60 * 1000) {
    return NextResponse.json(
      { error: "Cancellation window has expired" },
      { status: 400 },
    )
  }

  if (order.status !== "pending" && order.status !== "confirmed") {
    return NextResponse.json(
      { error: "Order cannot be cancelled at this stage" },
      { status: 400 },
    )
  }

  if (order.cases && order.cases.length > 0) {
    return NextResponse.json(
      { error: "Order has an open case" },
      { status: 400 },
    )
  }

  try {
    const isLegacyTestOrder = order.square_order_id?.startsWith("test-")
    if (order.square_order_id && !isLegacyTestOrder) {
      await refundOrder(
        order.square_order_id,
        order.total_cents,
        "Customer cancelled order within 2 hours",
      )
    }

    const { error: updateError } = await admin
      .from("orders")
      .update({ status: "canceled" })
      .eq("id", resolvedParams.id)

    if (updateError)
      throw new Error(`Cannot update order status: ${updateError.message}`)

    const { error: logError } = await admin.from("audit_logs").insert({
      admin_id: user.id,
      action: "cancel_order",
      target_table: "orders",
      target_id: resolvedParams.id,
      new_value: { status: "canceled" },
      notes: "Customer cancelled order within 2 hours",
    })
    if (logError) console.error("[cancel-order] audit log failed:", logError)

    const customerEmail =
      (order.shipping_address?.email as string | undefined) || user.email
    const customerName =
      (order.shipping_address?.fullName as string | undefined) ?? "there"

    if (customerEmail) {
      await sendOrderCanceled({
        to: customerEmail,
        customerName,
        orderNumber: order.square_order_id,
        reason: "Customer cancelled within 2 hours",
      }).catch((err) => console.error("[cancel-order] email failed:", err))
    }

    revalidatePath("/orders")
    return NextResponse.json({ ok: true })
  } catch (err: unknown) {
    console.error("[cancel-order]", err)
    const e = err as { errors?: { detail?: string }[]; message?: string }
    const errorMsg =
      e?.errors?.[0]?.detail || e?.message || "Failed to cancel order"
    return NextResponse.json({ error: errorMsg }, { status: 500 })
  }
}
