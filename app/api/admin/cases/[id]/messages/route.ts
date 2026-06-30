import { NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"
import { createAdminClient } from "@/lib/supabase/admin"
import { isCaseMessagingLocked } from "@/lib/cases/messaging"
import type { CaseStatus } from "@/lib/cases/types"
import { z } from "zod"

const messageSchema = z.object({
  message: z.string().min(1, "Message cannot be empty"),
})

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

    const { data: profile } = await supabase
      .from("profiles")
      .select("role")
      .eq("id", user.id)
      .single()

    if (profile?.role !== "admin") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 })
    }

    const json = await req.json()
    const parsed = messageSchema.safeParse(json)

    if (!parsed.success) {
      return NextResponse.json(
        { error: "Invalid data", details: parsed.error.issues },
        { status: 400 },
      )
    }

    const { message } = parsed.data
    const supabaseAdmin = createAdminClient()

    const { data: caseData, error: caseError } = await supabaseAdmin
      .from("cases")
      .select("id, status, chat_closed_at")
      .eq("id", caseId)
      .single()

    if (caseError || !caseData) {
      return NextResponse.json({ error: "Case not found" }, { status: 404 })
    }

    if (
      isCaseMessagingLocked({
        status: caseData.status as CaseStatus,
        chat_closed_at: caseData.chat_closed_at,
      })
    ) {
      return NextResponse.json(
        { error: "Messaging is disabled for this case" },
        { status: 403 },
      )
    }

    // 1. Add message
    const { error: insertError } = await supabaseAdmin
      .from("case_messages")
      .insert({
        case_id: caseId,
        sender_id: user.id,
        message,
      })

    if (insertError) {
      return NextResponse.json(
        { error: "Failed to add message" },
        { status: 500 },
      )
    }

    // 2. Change status to pending_review if it was open
    if (caseData.status === "open") {
      await supabaseAdmin
        .from("cases")
        .update({ status: "pending_review" })
        .eq("id", caseId)
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("[POST /api/admin/cases/[id]/messages]", error)
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 },
    )
  }
}
