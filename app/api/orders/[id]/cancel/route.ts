import { NextRequest, NextResponse } from "next/server"
import { revalidatePath } from "next/cache"
import { createAdminClient } from "@/lib/supabase/admin"
import { createClient } from "@/lib/supabase/server"
import { refundOrder } from "@/lib/square/refund"
import { Resend } from "resend"

const resend = new Resend(process.env.RESEND_API_KEY)

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

  // 1. Fetch order
  const { data: order, error } = await admin
    .from("orders")
    .select("*, cases(id)")
    .eq("id", resolvedParams.id)
    .eq("user_id", user.id)
    .single()

  if (error || !order) {
    return NextResponse.json({ error: "Order not found" }, { status: 404 })
  }

  // 2. Validate 2-hour window
  const orderTime = new Date(order.created_at).getTime()
  if (Date.now() - orderTime > 2 * 60 * 60 * 1000) {
    return NextResponse.json(
      { error: "Cancellation window has expired" },
      { status: 400 },
    )
  }

  // 3. Validate status
  if (order.status !== "pending" && order.status !== "confirmed") {
    return NextResponse.json(
      { error: "Order cannot be cancelled at this stage" },
      { status: 400 },
    )
  }

  // 4. Validate no cases
  if (order.cases && order.cases.length > 0) {
    return NextResponse.json(
      { error: "Order has an open case" },
      { status: 400 },
    )
  }

  try {
    // 5. Call Square Refund API — skip for test orders (never charged in Square)
    const isTestOrder =
      order.square_order_id?.startsWith("test-") ||
      process.env.NEXT_PUBLIC_PAYMENT_MODE === "test"

    if (order.square_order_id && !isTestOrder) {
      await refundOrder(
        order.square_order_id,
        order.total_cents,
        "Customer cancelled order within 2 hours",
      )
    }

    // 6. Update status to cancelled
    const { error: updateError } = await admin
      .from("orders")
      .update({ status: "cancelled" })
      .eq("id", resolvedParams.id)

    if (updateError) {
      console.error(
        "[cancel-order] status='cancelled' failed:",
        updateError.message,
      )
      // Try alternate spelling in case of DB check constraint
      const { error: altError } = await admin
        .from("orders")
        .update({ status: "canceled" })
        .eq("id", resolvedParams.id)
      if (altError)
        throw new Error(`Cannot update order status: ${updateError.message}`)
    }

    // 7. Log to audit_logs
    const { error: logError } = await admin.from("audit_logs").insert({
      admin_id: user.id,
      action: "cancel_order",
      target_table: "orders",
      target_id: resolvedParams.id,
      new_value: { status: "cancelled" },
      notes: "Customer cancelled order within 2 hours",
    })
    if (logError) console.error("[cancel-order] audit log failed:", logError)

    // 8. Send email
    if (process.env.RESEND_API_KEY) {
      const customerEmail = order.shipping_address?.email || user.email
      await resend.emails.send({
        from: "Metamorfosis <no-reply@metamorfosisllc.com>",
        replyTo: "hello@metamorfosisllc.com",
        to: customerEmail,
        subject: `Order Cancelled - ${order.square_order_id}`,
        html: `<p>Your order ${order.square_order_id} has been cancelled and refunded successfully.</p>`,
      })
    }

    revalidatePath("/orders")
    return NextResponse.json({ ok: true })
  } catch (err: unknown) {
    console.error("[cancel-order]", err)

    // Attempt to extract Square ApiError details or fallback to error message
    const e = err as { errors?: { detail?: string }[]; message?: string }
    const errorMsg =
      e?.errors?.[0]?.detail || e?.message || "Failed to cancel order"
    return NextResponse.json({ error: errorMsg }, { status: 500 })
  }
}
