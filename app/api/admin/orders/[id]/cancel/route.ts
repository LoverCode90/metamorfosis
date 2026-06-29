import { NextRequest, NextResponse } from "next/server"
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

  // Verify admin
  const { data: profile } = await admin
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single()

  if (profile?.role !== "admin") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 })
  }

  // Parse body
  let reason = "Admin cancelled order"
  try {
    const body = await request.json()
    if (body.reason) {
      reason = body.reason
    }
  } catch {}

  // 1. Fetch order
  const { data: order, error } = await admin
    .from("orders")
    .select("*")
    .eq("id", resolvedParams.id)
    .single()

  if (error || !order) {
    return NextResponse.json({ error: "Order not found" }, { status: 404 })
  }

  // 2. Validate status
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
    // 3. Call Square Refund API. Legacy "test-" orders were never charged in
    // Square, so skip the refund call for them (real orders always refund).
    const isLegacyTestOrder = order.square_order_id?.startsWith("test-")
    if (order.square_order_id && !isLegacyTestOrder) {
      await refundOrder(order.square_order_id, order.total_cents, reason)
    }

    // 4. Update status to canceled (DB enum value — single L)
    await admin
      .from("orders")
      .update({ status: "canceled" })
      .eq("id", resolvedParams.id)

    // 5. Log to audit_logs
    await admin.from("audit_logs").insert({
      admin_id: user.id,
      action: "admin_cancel_order",
      target_table: "orders",
      target_id: resolvedParams.id,
      new_value: { status: "canceled" },
      notes: reason,
    })

    // 6. Send email
    if (process.env.RESEND_API_KEY) {
      const customerEmail = order.shipping_address?.email
      if (customerEmail) {
        await resend.emails.send({
          from: "Metamorfosis <no-reply@metamorfosisllc.com>",
          replyTo: "hello@metamorfosisllc.com",
          to: customerEmail,
          subject: `Your Order ${order.square_order_id} has been cancelled`,
          html: `
            <p>Your order ${order.square_order_id} has been cancelled.</p>
            ${reason && reason !== "Admin cancelled order" ? `<p><strong>Reason:</strong> ${reason}</p>` : ""}
            <p>You will receive a full refund to your payment method within 3-5 business days. If you have questions contact us at hello@metamorfosisllc.com</p>
          `,
        })
      }
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
