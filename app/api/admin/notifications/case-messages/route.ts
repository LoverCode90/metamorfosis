import { NextResponse } from "next/server"

import { createClient } from "@/lib/supabase/server"
import { createAdminClient } from "@/lib/supabase/admin"
import { requireAdmin } from "@/lib/admin/require-admin"

interface CaseMessageRow {
  id: string
  sender_id: string | null
  message: string
  created_at: string
}

interface CaseRow {
  id: string
  customer_id: string
  status: string
  profiles: { full_name: string } | null
  case_messages: CaseMessageRow[] | null
}

export interface AdminCaseNotification {
  caseId: string
  caseNumber: string
  customerName: string
  messagePreview: string
  createdAt: string
  latestMessageId: string
}

/** Cases where the customer sent the latest message and needs a reply. */
export async function GET() {
  const supabase = await createClient()
  const gate = await requireAdmin(supabase)
  if (!gate.ok) {
    return NextResponse.json({ error: gate.error }, { status: gate.status })
  }

  const admin = createAdminClient()
  const { data } = await admin
    .from("cases")
    .select(
      `id, customer_id, status,
       profiles ( full_name ),
       case_messages ( id, sender_id, message, created_at )`,
    )
    .in("status", ["open", "pending_review"])
    .order("updated_at", { ascending: false })
    .limit(50)

  const rows = (data as unknown as CaseRow[] | null) ?? []

  const notifications: AdminCaseNotification[] = rows
    .map((row) => {
      const messages = row.case_messages ?? []
      if (messages.length === 0) return null

      const latest = messages.reduce((current, candidate) =>
        new Date(candidate.created_at) >= new Date(current.created_at)
          ? candidate
          : current,
      )

      if (latest.sender_id === row.customer_id) {
        return {
          caseId: row.id,
          caseNumber: row.id.slice(0, 8).toUpperCase(),
          customerName: row.profiles?.full_name ?? "Customer",
          messagePreview:
            latest.message.length > 80
              ? `${latest.message.slice(0, 80)}…`
              : latest.message,
          createdAt: latest.created_at,
          latestMessageId: latest.id,
        }
      }

      return null
    })
    .filter((item): item is AdminCaseNotification => item !== null)
    .sort(
      (left, right) =>
        new Date(right.createdAt).getTime() -
        new Date(left.createdAt).getTime(),
    )
    .slice(0, 12)

  return NextResponse.json({ notifications, count: notifications.length })
}
