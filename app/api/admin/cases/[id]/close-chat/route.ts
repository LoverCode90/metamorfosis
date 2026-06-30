import { NextResponse } from "next/server"

import { createClient } from "@/lib/supabase/server"
import { createAdminClient } from "@/lib/supabase/admin"
import { isCaseMessagingLocked } from "@/lib/cases/messaging"
import type { CaseStatus } from "@/lib/cases/types"

export async function POST(
  _request: Request,
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
        { error: "Messaging is already disabled for this case" },
        { status: 409 },
      )
    }

    const { error: updateError } = await supabaseAdmin
      .from("cases")
      .update({ chat_closed_at: new Date().toISOString() })
      .eq("id", caseId)

    if (updateError) {
      return NextResponse.json(
        { error: "Failed to close chat" },
        { status: 500 },
      )
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("[POST /api/admin/cases/[id]/close-chat]", error)
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 },
    )
  }
}
