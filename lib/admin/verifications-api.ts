import type { StatusFilter, VerificationRow } from "@/lib/admin/verifications"

export interface VerificationsPage {
  items: VerificationRow[]
  nextCursor: string | null
}

/**
 * Fetches a page of verifications for the given status filter.
 * @param status - Status filter to query.
 * @param cursor - Opaque pagination cursor from a prior page.
 */
export async function fetchVerifications(
  status: StatusFilter,
  cursor?: string,
): Promise<VerificationsPage> {
  const params = new URLSearchParams({ status })
  if (cursor) params.set("cursor", cursor)

  const res = await fetch(`/api/admin/verifications?${params.toString()}`)
  return (await res.json()) as VerificationsPage
}

/**
 * Approves a verification. Throws with the server message on failure.
 * @param id - Verification id.
 */
export async function approveVerification(id: string): Promise<void> {
  const res = await fetch(`/api/admin/verifications/${id}/approve`, {
    method: "POST",
  })
  if (!res.ok) {
    const err = (await res.json()) as { error?: string }
    throw new Error(err.error ?? "Approval failed")
  }
}

/**
 * Rejects a verification with a reason. Throws with the server message on failure.
 * @param id - Verification id.
 * @param reason - Rejection reason shown to the user.
 */
export async function rejectVerification(
  id: string,
  reason: string,
): Promise<void> {
  const res = await fetch(`/api/admin/verifications/${id}/reject`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ reason }),
  })
  if (!res.ok) {
    const err = (await res.json()) as { error?: string }
    throw new Error(err.error ?? "Rejection failed")
  }
}

/**
 * Fetches a short-lived signed URL for a verification's license document.
 * @param id - Verification id.
 * @returns The URL, or null when unavailable.
 */
export async function fetchDocumentUrl(id: string): Promise<string | null> {
  const res = await fetch(`/api/admin/verifications/${id}/document-url`)
  const data = (await res.json()) as { url?: string; error?: string }
  return data.url ?? null
}
