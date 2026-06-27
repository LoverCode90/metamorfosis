import { createClient } from "@/lib/supabase/client"
import type { DbOrder } from "@/lib/orders/types"

interface SubmitCaseArgs {
  order: DbOrder
  variationId: string
  reason: string
  explanation: string
  condition?: string
  files: File[]
}

/**
 * Uploads evidence photos to the `case-evidence` bucket (keeping the
 * `{userId}/{caseId}/` path the admin reader expects) and creates the support
 * case. Throws with a user-facing message on failure.
 */
export async function submitCase({
  order,
  variationId,
  reason,
  explanation,
  condition,
  files,
}: SubmitCaseArgs): Promise<void> {
  const supabase = createClient()
  const caseId = crypto.randomUUID()
  const evidenceUrls: string[] = []

  const {
    data: { session },
    error: sessionErr,
  } = await supabase.auth.getSession()
  if (sessionErr || !session) throw new Error("User not authenticated")
  const userId = session.user.id

  for (let i = 0; i < files.length; i++) {
    const file = files[i]
    const ext = file.name.split(".").pop()
    const path = `${userId}/${caseId}/${i + 1}.${ext}`

    const { error: uploadErr } = await supabase.storage
      .from("case-evidence")
      .upload(path, file)
    if (uploadErr) throw new Error(uploadErr.message)

    evidenceUrls.push(path)
  }

  const res = await fetch("/api/profile/cases", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      id: caseId,
      orderId: order.id,
      variationId,
      reason,
      explanation,
      condition,
      evidenceUrls,
    }),
  })

  if (!res.ok) {
    const data = await res.json()
    throw new Error(data.error || "Failed to submit case")
  }
}
