import { NextRequest, NextResponse } from "next/server"
import { createAdminClient } from "@/lib/supabase/admin"
import { createClient } from "@/lib/supabase/server"
import { refundOrder } from "@/lib/square/refund"
import { Resend } from "resend"

const resend = new Resend(process.env.RESEND_API_KEY)

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const resolvedParams = await params
  const supabase = await createClient()
  const { data: { session } } = await supabase.auth.getSession()

  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const admin = createAdminClient()

  // 1. Fetch order
  const { data: order, error } = await admin
    .from("orders")
    .select("*, cases(id)")
    .eq("id", resolvedParams.id)
    .eq("user_id", session.user.id)
    .single()

  if (error || !order) {
    return NextResponse.json({ error: "Order not found" }, { status: 404 })
  }

  // 2. Validate 2-hour window
  const orderTime = new Date(order.created_at).getTime()
  if (Date.now() - orderTime > 2 * 60 * 60 * 1000) {
    return NextResponse.json({ error: "Cancellation window has expired" }, { status: 400 })
  }

  // 3. Validate status
  if (order.status !== "pending" && order.status !== "confirmed") {
    return NextResponse.json({ error: "Order cannot be cancelled at this stage" }, { status: 400 })
  }

  // 4. Validate no cases
  if (order.cases && order.cases.length > 0) {
    return NextResponse.json({ error: "Order has an open case" }, { status: 400 })
  }

  try {
    // 5. Call Square Refund API
    if (order.square_order_id) {
      await refundOrder(order.square_order_id, order.total_cents, "Customer cancelled order within 2 hours")
    }

    // 6. Update status to cancelled
    await admin
      .from("orders")
      .update({ status: "cancelled" })
      .eq("id", resolvedParams.id)

    // 7. Log to audit_logs
    await admin.from("audit_logs").insert({
      actor_id: session.user.id,
      action: "cancel_order",
      entity_type: "order",
      entity_id: resolvedParams.id,
      details: { reason: "Customer cancelled order within 2 hours" },
    })

    // 8. Send email
    if (process.env.RESEND_API_KEY) {
      const customerEmail = order.shipping_address?.email || session.user.email
      await resend.emails.send({
        from: "Metamorfosis <hello@shopmetamorfosis.com>",
        to: customerEmail,
        subject: `Order Cancelled - ${order.square_order_id}`,
        html: `<p>Your order ${order.square_order_id} has been cancelled and refunded successfully.</p>`,
      })
    }

    return NextResponse.json({ ok: true })
  } catch (err: any) {
    console.error("[cancel-order]", err)
    
    // Attempt to extract Square ApiError details or fallback to error message
    const errorMsg = err?.errors?.[0]?.detail || err?.message || "Failed to cancel order"
    return NextResponse.json({ error: errorMsg }, { status: 500 })
  }
}
