import { NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"
import { z } from "zod"

const caseSchema = z.object({
  orderId: z.string().uuid(),
  variationId: z.string().uuid(),
  reason: z.enum([
    "damaged",
    "wrong_item",
    "defective",
    "not_as_described",
    "no_longer_needed",
    "ordered_by_mistake",
    "other",
  ]),
  explanation: z.string().min(100, "Explanation must be at least 100 characters"),
  evidenceUrls: z.array(z.string().url()).max(3).optional().default([]),
})

export async function POST(req: Request) {
  try {
    const supabase = await createClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const json = await req.json()
    const parsed = caseSchema.safeParse(json)

    if (!parsed.success) {
      return NextResponse.json({ error: "Invalid data", details: parsed.error.issues }, { status: 400 })
    }

    const { orderId, variationId, reason, explanation, evidenceUrls } = parsed.data

    // 1. Verify order belongs to user and is delivered within 14 days
    const { data: order, error: orderError } = await supabase
      .from("orders")
      .select("id, delivered_at")
      .eq("id", orderId)
      .eq("user_id", user.id)
      .single()

    if (orderError || !order) {
      return NextResponse.json({ error: "Order not found" }, { status: 404 })
    }

    if (!order.delivered_at) {
      return NextResponse.json({ error: "Order is not yet delivered" }, { status: 400 })
    }

    const deliveredDate = new Date(order.delivered_at)
    const fourteenDaysAgo = new Date()
    fourteenDaysAgo.setDate(fourteenDaysAgo.getDate() - 14)

    if (deliveredDate < fourteenDaysAgo) {
      return NextResponse.json({ error: "Order was delivered more than 14 days ago" }, { status: 400 })
    }

    // 2. Max 1 open case per order
    const { data: existingCase, error: existingCaseError } = await supabase
      .from("cases")
      .select("id")
      .eq("order_id", orderId)
      .not("status", "in", "('closed', 'rejected', 'approved')")
      .maybeSingle()

    if (existingCaseError) {
      return NextResponse.json({ error: "Database error" }, { status: 500 })
    }

    if (existingCase) {
      return NextResponse.json({ error: "An open case already exists for this order" }, { status: 400 })
    }

    // 3. Create case
    const { data: newCase, error: createError } = await supabase
      .from("cases")
      .insert({
        customer_id: user.id,
        order_id: orderId,
        variation_id: variationId,
        reason,
        explanation,
        evidence_images_urls: evidenceUrls,
        status: "open"
      })
      .select("id")
      .single()

    if (createError || !newCase) {
      return NextResponse.json({ error: "Failed to create case" }, { status: 500 })
    }

    return NextResponse.json({ success: true, caseId: newCase.id })
  } catch (error) {
    console.error("[POST /api/profile/cases]", error)
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 })
  }
}
