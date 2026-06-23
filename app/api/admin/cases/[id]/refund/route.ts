import { NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"
import { createAdminClient } from "@/lib/supabase/admin"
import { refundOrder } from "@/lib/square/refund"
import { z } from "zod"

const refundSchema = z.object({
  amountCents: z.number().int().positive(),
  reason: z.string().optional().default("Customer requested refund"),
})

export async function POST(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id: caseId } = await params
    const supabase = await createClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Double check admin role
    const { data: profile } = await supabase
      .from("profiles")
      .select("role")
      .eq("id", user.id)
      .single()

    if (profile?.role !== "admin") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 })
    }

    const json = await req.json()
    const parsed = refundSchema.safeParse(json)

    if (!parsed.success) {
      return NextResponse.json({ error: "Invalid data", details: parsed.error.issues }, { status: 400 })
    }

    const { amountCents, reason } = parsed.data

    const supabaseAdmin = createAdminClient()

    // 1. Get the case and related order
    const { data: caseData, error: caseError } = await supabaseAdmin
      .from("cases")
      .select("*, orders(id, square_order_id)")
      .eq("id", caseId)
      .single()

    if (caseError || !caseData) {
      return NextResponse.json({ error: "Case not found" }, { status: 404 })
    }

    const squareOrderId = caseData.orders?.square_order_id
    if (!squareOrderId) {
      return NextResponse.json({ error: "No Square Order ID found" }, { status: 400 })
    }

    // 2. Call Square refund
    try {
      await refundOrder(squareOrderId, amountCents, reason)
    } catch (refundError: any) {
      console.error("Square refund failed:", refundError)
      return NextResponse.json({ error: "Square refund failed", details: refundError.message }, { status: 500 })
    }

    // 3. Update case status to closed
    const resolvedAt = new Date().toISOString()
    await supabaseAdmin
      .from("cases")
      .update({ status: "closed", resolved_at: resolvedAt })
      .eq("id", caseId)

    // 4. Update order status to refunded
    await supabaseAdmin
      .from("orders")
      .update({ status: "refunded" })
      .eq("id", caseData.order_id)

    // 5. Delete evidence files
    const { data: files } = await supabaseAdmin.storage.from("case-evidence").list(caseId)
    if (files && files.length > 0) {
      const filePaths = files.map(f => `${caseId}/${f.name}`)
      await supabaseAdmin.storage.from("case-evidence").remove(filePaths)
    }

    // 6. Write to audit_logs
    await supabaseAdmin
      .from("audit_logs")
      .insert({
        admin_id: user.id,
        action: "case_status_changed",
        target_table: "cases",
        target_id: caseId,
        previous_value: caseData,
        new_value: { status: "closed", resolved_at: resolvedAt },
        notes: `Refunded ${amountCents} cents. Reason: ${reason}`,
      })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("[POST /api/admin/cases/[id]/refund]", error)
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 })
  }
}
