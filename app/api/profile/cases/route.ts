import { NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"
import { z } from "zod"
import { checkCaseEligibility } from "@/lib/profile/case-eligibility"
import { sendCaseSubmitted } from "@/lib/email/case-notifications"

const caseSchema = z.object({
  // Use the client-generated ID so it matches the evidence upload paths.
  id: z.string().uuid(),
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
  explanation: z.string().min(40, "Explanation must be at least 40 characters"),
  condition: z
    .enum(["unopened", "opened_unused", "used_good", "used_worn"])
    .optional(),
  // Stored as Supabase Storage paths (e.g. "userId/caseId/1.jpg"), not full URLs.
  evidenceUrls: z.array(z.string().min(1)).max(3).optional().default([]),
})

export async function POST(req: Request) {
  try {
    const supabase = await createClient()
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const parsed = caseSchema.safeParse(await req.json())
    if (!parsed.success) {
      return NextResponse.json(
        { error: "Invalid data", details: parsed.error.issues },
        { status: 400 },
      )
    }

    const {
      id,
      orderId,
      variationId,
      reason,
      explanation,
      condition,
      evidenceUrls,
    } = parsed.data

    const eligibility = await checkCaseEligibility(supabase, {
      orderId,
      variationId,
      userId: user.id,
      reason,
      evidenceCount: evidenceUrls.length,
    })
    if (!eligibility.ok) {
      return NextResponse.json(
        { error: eligibility.error },
        { status: eligibility.status },
      )
    }

    // Max 1 open case per order
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
      return NextResponse.json(
        { error: "An open case already exists for this order" },
        { status: 400 },
      )
    }

    const { data: newCase, error: createError } = await supabase
      .from("cases")
      .insert({
        id,
        customer_id: user.id,
        order_id: orderId,
        variation_id: variationId,
        reason,
        explanation,
        condition: condition ?? null,
        evidence_images_urls: evidenceUrls,
        status: "open",
      })
      .select("id")
      .single()

    if (createError || !newCase) {
      return NextResponse.json(
        { error: "Failed to create case" },
        { status: 500 },
      )
    }

    // Confirmation email (fire-and-forget — never block the response)
    const { data: profile } = await supabase
      .from("profiles")
      .select("full_name")
      .eq("id", user.id)
      .single()

    sendCaseSubmitted({
      to: user.email ?? "",
      customerName: profile?.full_name ?? "there",
      caseId: newCase.id,
      orderId,
      reason,
    }).catch((err) => console.error("[cases] submit email failed:", err))

    return NextResponse.json({ success: true, caseId: newCase.id })
  } catch (error) {
    console.error("[POST /api/profile/cases]", error)
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 },
    )
  }
}
