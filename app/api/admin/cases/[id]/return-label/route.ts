import { NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"
import { createAdminClient } from "@/lib/supabase/admin"
import { createReturnLabel } from "@/lib/shippo/returns"

export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id: caseId } = await params
    const supabase = await createClient()
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser()

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

    const supabaseAdmin = createAdminClient()

    // 1. Get the case and original order to find shippo_transaction_id
    const { data: caseData, error: caseError } = await supabaseAdmin
      .from("cases")
      .select("*, orders(id, shippo_transaction_id)")
      .eq("id", caseId)
      .single()

    if (caseError || !caseData) {
      return NextResponse.json({ error: "Case not found" }, { status: 404 })
    }

    const shippoTransactionId = caseData.orders?.shippo_transaction_id
    if (!shippoTransactionId) {
      return NextResponse.json(
        { error: "Original order has no Shippo transaction ID" },
        { status: 400 },
      )
    }

    // 2. Call Shippo to create return label
    let shippoRes: Awaited<ReturnType<typeof createReturnLabel>>
    try {
      shippoRes = await createReturnLabel(shippoTransactionId)
    } catch (err: unknown) {
      console.error("Shippo return label failed:", err)
      const details = err instanceof Error ? err.message : String(err)
      return NextResponse.json(
        { error: "Shippo return label generation failed", details },
        { status: 500 },
      )
    }

    const labelUrl = shippoRes.label_url
    if (!labelUrl) {
      return NextResponse.json(
        { error: "Shippo did not return a label_url" },
        { status: 500 },
      )
    }

    // 3. Update case with the prepaid label URL and shippo_return_transaction_id
    await supabaseAdmin
      .from("cases")
      .update({
        prepaid_label_url: labelUrl,
        shippo_return_transaction_id: shippoRes.object_id,
      })
      .eq("id", caseId)

    // 4. Write to audit_logs
    await supabaseAdmin.from("audit_logs").insert({
      admin_id: user.id,
      action: "return_label_generated",
      target_table: "cases",
      target_id: caseId,
      previous_value: { prepaid_label_url: caseData.prepaid_label_url },
      new_value: { prepaid_label_url: labelUrl },
      notes: "Generated return label via Shippo",
    })

    return NextResponse.json({ success: true, labelUrl })
  } catch (error) {
    console.error("[POST /api/admin/cases/[id]/return-label]", error)
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 },
    )
  }
}
