import { NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"
import { z } from "zod"

const messageSchema = z.object({
  message: z.string().min(1, "Message cannot be empty"),
})

export async function POST(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id: caseId } = await params
    const supabase = await createClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const json = await req.json()
    const parsed = messageSchema.safeParse(json)

    if (!parsed.success) {
      return NextResponse.json({ error: "Invalid data", details: parsed.error.issues }, { status: 400 })
    }

    const { message } = parsed.data

    // 1. Verify case belongs to user
    const { data: existingCase, error: caseError } = await supabase
      .from("cases")
      .select("id")
      .eq("id", caseId)
      .eq("customer_id", user.id)
      .single()

    if (caseError || !existingCase) {
      return NextResponse.json({ error: "Case not found" }, { status: 404 })
    }

    // 2. Add message
    const { error: insertError } = await supabase
      .from("case_messages")
      .insert({
        case_id: caseId,
        sender_id: user.id,
        message,
      })

    if (insertError) {
      return NextResponse.json({ error: "Failed to add message" }, { status: 500 })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("[POST /api/profile/cases/[id]/messages]", error)
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 })
  }
}
