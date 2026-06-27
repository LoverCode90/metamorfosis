import { NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"
import { createAdminClient } from "@/lib/supabase/admin"
import { refundOrder } from "@/lib/square/refund"
import { STORE_FAULT_REASONS } from "@/lib/constants"
import { sendCaseAccepted } from "@/lib/email/case-notifications"
import { requireAdmin } from "@/lib/admin/require-admin"
import { getCaseCustomer } from "@/lib/profile/case-customer"
import { z } from "zod"

// The refund amount is computed server-side from the order — never trust a
// client-sent amount.
const refundSchema = z.object({
  reason: z.string().optional().default("Customer requested refund"),
})

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

    // The admin UI posts with no body, so tolerate an empty request.
    const json: unknown = await req.json().catch(() => ({}))
    const parsed = refundSchema.safeParse(json)

    if (!parsed.success) {
      return NextResponse.json(
        { error: "Invalid data", details: parsed.error.issues },
        { status: 400 },
      )
    }

    const { reason } = parsed.data

    const supabaseAdmin = createAdminClient()

    // 1. Get the case and related order
    const { data: caseData, error: caseError } = await supabaseAdmin
      .from("cases")
      .select("*, orders(id, square_order_id, total_cents, surcharge_cents)")
      .eq("id", caseId)
      .single()

    if (caseError || !caseData) {
      return NextResponse.json({ error: "Case not found" }, { status: 404 })
    }

    const squareOrderId = caseData.orders?.square_order_id
    if (!squareOrderId) {
      return NextResponse.json(
        { error: "No Square Order ID found" },
        { status: 400 },
      )
    }

    // Store-fault returns get a full refund (surcharge included); customer-fault
    // returns are refunded minus the non-refundable card surcharge. Computed
    // server-side — the admin never sends the amount.
    const isStoreFault = (STORE_FAULT_REASONS as readonly string[]).includes(
      caseData.reason,
    )
    const totalCents = caseData.orders?.total_cents ?? 0
    const surchargeCents = caseData.orders?.surcharge_cents ?? 0
    const refundAmountCents = isStoreFault
      ? totalCents
      : totalCents - surchargeCents

    if (refundAmountCents <= 0) {
      return NextResponse.json(
        { error: "Nothing to refund for this order" },
        { status: 400 },
      )
    }

    // 2. Call Square refund
    try {
      await refundOrder(squareOrderId, refundAmountCents, reason)
    } catch (refundError: unknown) {
      console.error("Square refund failed:", refundError)
      const msg =
        refundError instanceof Error ? refundError.message : String(refundError)
      return NextResponse.json(
        { error: "Square refund failed", details: msg },
        { status: 500 },
      )
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

    // 5. Delete evidence files (paths stored on the case row are the source of
    // truth; the storage folder is keyed by the client-generated id, not caseId)
    const evidencePaths: string[] = caseData.evidence_images_urls ?? []
    if (evidencePaths.length > 0) {
      await supabaseAdmin.storage.from("case-evidence").remove(evidencePaths)
    }

    // 6. Write to audit_logs
    await supabaseAdmin.from("audit_logs").insert({
      admin_id: gate.userId,
      action: "case_status_changed",
      target_table: "cases",
      target_id: caseId,
      previous_value: caseData,
      new_value: { status: "closed", resolved_at: resolvedAt },
      notes: `Refunded ${refundAmountCents} cents (${
        isStoreFault ? "store fault — full" : "customer fault — minus surcharge"
      }). Reason: ${reason}`,
    })

    // 7. Notify the customer. When a prepaid return label was generated, send
    // the approval email with drop-off instructions (carrier from Shippo).
    if (caseData.prepaid_label_url) {
      const customer = await getCaseCustomer(
        supabaseAdmin,
        caseData.customer_id,
      )
      if (customer.email) {
        await sendCaseAccepted({
          to: customer.email,
          customerName: customer.name,
          labelUrl: caseData.prepaid_label_url,
          carrierName: caseData.carrier_name ?? "the carrier",
        }).catch((err) => console.error("[refund] accepted email failed:", err))
      }
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("[POST /api/admin/cases/[id]/refund]", error)
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 },
    )
  }
}
