import { NextResponse } from "next/server"
import { z } from "zod"

import { createClient } from "@/lib/supabase/server"
import { createAdminClient } from "@/lib/supabase/admin"
import { requireAdmin } from "@/lib/admin/require-admin"

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

    const admin = createAdminClient()
    const { error: updateError } = await admin
      .from("orders")
      .update({ status: parsed.data.status })
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
      new_value: { status: parsed.data.status },
      notes: `Status set to ${parsed.data.status}.`,
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("[POST /api/admin/orders/[id]/status]", error)
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 },
    )
  }
}
