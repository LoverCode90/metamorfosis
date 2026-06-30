"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"

/** Closes the admin ↔ customer chat for an open case. */
export function useAdminCloseChat(caseId: string) {
  const router = useRouter()
  const [isClosing, setIsClosing] = useState(false)
  const [error, setError] = useState("")

  async function closeChat() {
    setIsClosing(true)
    setError("")
    try {
      const response = await fetch(`/api/admin/cases/${caseId}/close-chat`, {
        method: "POST",
      })
      if (!response.ok) {
        const data = await response.json().catch(() => ({}))
        throw new Error(data.error || "Failed to close chat")
      }
      router.refresh()
    } catch (closeError: unknown) {
      setError(
        closeError instanceof Error
          ? closeError.message
          : "Something went wrong",
      )
    } finally {
      setIsClosing(false)
    }
  }

  return { closeChat, isClosing, error }
}
