import { NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"
import { createAdminClient } from "@/lib/supabase/admin"
import { sendCaseFraud } from "@/lib/email/case-notifications"
import { requireAdmin } from "@/lib/admin/require-admin"
import { getCaseCustomer } from "@/lib/profile/case-customer"
import { itemLabel } from "@/lib/orders/item-label"

export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id: caseId } = await params
    const supabase = await createClient()
    const gate = await requireAdmin(supabase)
    if (!gate.ok) {
      return NextResponse.json({ error: gate.error }, { status: gate.status })
    }

    const supabaseAdmin = createAdminClient()

    const { data: caseData, error: caseError } = await supabaseAdmin
      .from("cases")
      .select("*, orders(id)")
      .eq("id", caseId)
      .single()

    if (caseError || !caseData) {
      return NextResponse.json({ error: "Case not found" }, { status: 404 })
    }

    // Resolve the customer and the item name (server-side — never trust client)
    const customer = await getCaseCustomer(supabaseAdmin, caseData.customer_id)

    const { data: orderItem } = await supabaseAdmin
      .from("order_items")
      .select("product_variations(name_en, product_translations(name_en))")
      .eq("order_id", caseData.order_id)
      .eq("variation_id", caseData.variation_id)
      .single()

    const variation = orderItem?.product_variations as {
      name_en?: string
      product_translations?: { name_en?: string } | null
    } | null
    const itemName =
      itemLabel(variation?.product_translations?.name_en, variation?.name_en) ||
      "your item"

    const resolvedAt = new Date().toISOString()
    await supabaseAdmin
      .from("cases")
      .update({
        status: "fraud",
        resolved_at: resolvedAt,
        admin_notes: "Marked as fraud — photo/condition mismatch.",
      })
      .eq("id", caseId)

    if (customer.email) {
      await sendCaseFraud({
        to: customer.email,
        customerName: customer.name,
        itemDescription: itemName,
      }).catch((err) => console.error("[fraud] email failed:", err))
    }

    await supabaseAdmin.from("audit_logs").insert({
      admin_id: gate.userId,
      action: "case_status_changed",
      target_table: "cases",
      target_id: caseId,
      previous_value: caseData,
      new_value: { status: "fraud", resolved_at: resolvedAt },
      notes: "Marked as fraud (photo mismatch).",
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("[POST /api/admin/cases/[id]/fraud]", error)
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 },
    )
  }
}
