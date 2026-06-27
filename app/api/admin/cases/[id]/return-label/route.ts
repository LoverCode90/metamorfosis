import { NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"
import { createAdminClient } from "@/lib/supabase/admin"
import { createReturnLabel } from "@/lib/shippo/returns"
import { estimateReturnLabelCost } from "@/lib/shippo/estimate"
import { FROM_ADDRESS } from "@/lib/shippo/rates"
import { sendReturnUneconomical } from "@/lib/email/case-notifications"
import { requireAdmin } from "@/lib/admin/require-admin"
import { getCaseCustomer } from "@/lib/profile/case-customer"

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
      .select("*, orders(id, shippo_transaction_id, shipping_address)")
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

    // ── Viability: reject if return shipping would exceed the item's value ────
    const { data: orderItem } = await supabaseAdmin
      .from("order_items")
      .select("unit_price_cents, product_variations(name_en)")
      .eq("order_id", caseData.order_id)
      .eq("variation_id", caseData.variation_id)
      .single()

    const itemCents = orderItem?.unit_price_cents ?? 0
    const address = caseData.orders?.shipping_address
    if (address) {
      const returnRateCents = await estimateReturnLabelCost({
        customerAddress: {
          name: address.fullName,
          street1: address.streetLine1,
          street2: address.streetLine2,
          city: address.city,
          state: address.state,
          zip: address.zip,
          phone: address.phone,
        },
        storeAddress: FROM_ADDRESS,
      })

      if (returnRateCents !== null && returnRateCents >= itemCents) {
        const customer = await getCaseCustomer(
          supabaseAdmin,
          caseData.customer_id,
        )
        if (customer.email) {
          await sendReturnUneconomical({
            to: customer.email,
            customerName: customer.name,
            itemName:
              (orderItem?.product_variations as { name_en?: string } | null)
                ?.name_en ?? "your item",
            itemCents,
            shippingCents: returnRateCents,
          }).catch((err) => console.error("[return-label] email failed:", err))
        }
        return NextResponse.json(
          {
            error:
              "Return shipping cost exceeds item value. This return cannot be processed economically.",
            shippingCents: returnRateCents,
            itemCents,
          },
          { status: 422 },
        )
      }
    }

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

    await supabaseAdmin
      .from("cases")
      .update({
        prepaid_label_url: labelUrl,
        shippo_return_transaction_id: shippoRes.object_id,
        carrier_name: shippoRes.carrier ?? null,
      })
      .eq("id", caseId)

    await supabaseAdmin.from("audit_logs").insert({
      admin_id: gate.userId,
      action: "return_label_generated",
      target_table: "cases",
      target_id: caseId,
      previous_value: { prepaid_label_url: caseData.prepaid_label_url },
      new_value: {
        prepaid_label_url: labelUrl,
        carrier_name: shippoRes.carrier,
      },
      notes: "Generated return label via Shippo",
    })

    return NextResponse.json({
      success: true,
      labelUrl,
      carrier: shippoRes.carrier ?? null,
    })
  } catch (error) {
    console.error("[POST /api/admin/cases/[id]/return-label]", error)
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 },
    )
  }
}
