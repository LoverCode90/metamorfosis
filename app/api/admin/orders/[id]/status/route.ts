import { NextResponse } from "next/server"
import { z } from "zod"

import { createClient } from "@/lib/supabase/server"
import { createAdminClient } from "@/lib/supabase/admin"
import { requireAdmin } from "@/lib/admin/require-admin"
import { refundOrder } from "@/lib/square/refund"
import { runOrderStatusSideEffects } from "@/lib/orders/status-side-effects"
import { sendOrderCanceled } from "@/lib/email/order-status-emails"

const statusSchema = z.object({
  status: z.enum([
    "pending",
    "confirmed",
    "processing",
    "shipped",
    "delivered",
    "canceled",
    "refunded",
  ]),
})

export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id: orderId } = await params
    const supabase = await createClient()
    const gate = await requireAdmin(supabase)
    if (!gate.ok) {
      return NextResponse.json({ error: gate.error }, { status: gate.status })
    }

    const parsed = statusSchema.safeParse(await req.json().catch(() => ({})))
    if (!parsed.success) {
      return NextResponse.json({ error: "Invalid status" }, { status: 400 })
    }
    const newStatus = parsed.data.status
    const admin = createAdminClient()

    // Canceling must refund via Square BEFORE the DB flips to canceled.
    if (newStatus === "canceled") {
      const refundError = await refundForCancel(admin, orderId)
      if (refundError) {
        return NextResponse.json({ error: refundError }, { status: 502 })
      }
    }

    const { error: updateError } = await admin
      .from("orders")
      .update({ status: newStatus })
      .eq("id", orderId)
    if (updateError) {
      return NextResponse.json(
        { error: "Failed to update status" },
        { status: 500 },
      )
    }

    await admin.from("audit_logs").insert({
      admin_id: gate.userId,
      action: "order_status_changed",
      target_table: "orders",
      target_id: orderId,
      new_value: { status: newStatus },
      notes: `Status set to ${newStatus}.`,
    })

    // Customer notification emails (never block the response).
    await runOrderStatusSideEffects(admin, orderId, newStatus)

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("[POST /api/admin/orders/[id]/status]", error)
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 },
    )
  }
}

type AdminClient = ReturnType<typeof createAdminClient>

/**
 * Refunds the order in Square and emails the customer. Returns an error string
 * on failure (so the caller can abort before changing status), or null on OK.
 */
async function refundForCancel(
  admin: AdminClient,
  orderId: string,
): Promise<string | null> {
  const { data: order } = await admin
    .from("orders")
    .select(
      "id, square_order_id, total_cents, status, guest_email, shipping_address, profiles(full_name, email)",
    )
    .eq("id", orderId)
    .single()
  if (!order) return "Order not found"
  if (["shipped", "delivered", "canceled", "refunded"].includes(order.status)) {
    return "Order cannot be canceled at this stage"
  }

  // Legacy "test-" orders were never charged in Square — skip the refund call.
  const isLegacyTestOrder = order.square_order_id?.startsWith("test-")
  if (order.square_order_id && !isLegacyTestOrder) {
    try {
      await refundOrder(
        order.square_order_id,
        order.total_cents,
        "Order canceled by admin",
      )
    } catch (err) {
      console.error("[status/cancel] Square refund failed:", err)
      return "Square refund failed — order not canceled"
    }
  }

  const profile = order.profiles as {
    full_name?: string
    email?: string
  } | null
  const address = order.shipping_address as {
    fullName?: string
    email?: string
  } | null
  const email = profile?.email ?? address?.email ?? order.guest_email
  if (email) {
    await sendOrderCanceled({
      to: email,
      customerName: profile?.full_name ?? address?.fullName ?? "there",
      orderNumber: `#${order.id.slice(0, 8).toUpperCase()}`,
    }).catch((err) => console.error("[status/cancel] email failed:", err))
  }
  return null
}
