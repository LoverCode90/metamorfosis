import { NextResponse } from "next/server"

import { createClient } from "@/lib/supabase/server"

interface CaseMessageRow {
  id: string
  sender_id: string | null
  created_at: string
}

interface CaseRow {
  id: string
  order_id: string
  case_messages: CaseMessageRow[] | null
}

/**
 * Returns cases whose latest message came from support and includes the
 * message id so the client can notify at most once per reply.
 */
export async function GET() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const { data } = await supabase
    .from("cases")
    .select("id, order_id, case_messages ( id, sender_id, created_at )")
    .eq("customer_id", user.id)

  const rows = (data as unknown as CaseRow[] | null) ?? []
  const unread = rows
    .map((row) => {
      const messages = row.case_messages ?? []
      if (messages.length === 0) return null
      const latest = messages.reduce((current, candidate) =>
        new Date(candidate.created_at) >= new Date(current.created_at)
          ? candidate
          : current,
      )
      if (latest.sender_id === user.id) return null
      return {
        caseId: row.id,
        orderId: row.order_id,
        latestMessageId: latest.id,
      }
    })
    .filter((item): item is NonNullable<typeof item> => item !== null)

  return NextResponse.json({ unread })
}
