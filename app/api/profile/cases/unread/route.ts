import { NextResponse } from "next/server"

import { createClient } from "@/lib/supabase/server"

interface CaseRow {
  id: string
  order_id: string
  case_messages: { sender_id: string | null; created_at: string }[] | null
}

/**
 * Returns the customer's cases whose most recent message came from support
 * (i.e. an unread reply). Used to surface a "new message" toast on the client.
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
    .select("id, order_id, case_messages ( sender_id, created_at )")
    .eq("customer_id", user.id)

  const rows = (data as unknown as CaseRow[] | null) ?? []
  const unread = rows
    .filter((row) => {
      const messages = row.case_messages ?? []
      if (messages.length === 0) return false
      const latest = messages.reduce((a, b) =>
        new Date(a.created_at) >= new Date(b.created_at) ? a : b,
      )
      return latest.sender_id !== user.id
    })
    .map((row) => ({ caseId: row.id, orderId: row.order_id }))

  return NextResponse.json({ unread })
}
