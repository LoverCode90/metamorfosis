"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"

/**
 * Admin case message composer: input value, send lifecycle, and errors. Posts
 * to the admin messages route and refreshes so the new message appears.
 * @param caseId - The case the messages belong to.
 */
export function useAdminCaseMessages(caseId: string) {
  const router = useRouter()
  const [message, setMessage] = useState("")
  const [isSending, setIsSending] = useState(false)
  const [error, setError] = useState("")

  async function sendMessage(event: React.FormEvent) {
    event.preventDefault()
    const trimmed = message.trim()
    if (!trimmed) return

    setIsSending(true)
    setError("")
    try {
      const res = await fetch(`/api/admin/cases/${caseId}/messages`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: trimmed }),
      })
      if (!res.ok) {
        const data = await res.json().catch(() => ({}))
        throw new Error(data.error || "Failed to send message")
      }
      setMessage("")
      router.refresh()
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Something went wrong")
    } finally {
      setIsSending(false)
    }
  }

  return { message, setMessage, isSending, error, sendMessage }
}
