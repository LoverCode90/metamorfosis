"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"

import { sendCaseMessage } from "@/lib/cases/messages-api"

/**
 * Manages the case message composer: input value, send lifecycle, and errors.
 * Refreshes the route on success so the new message appears.
 * @param caseId - The case the messages belong to.
 */
export function useCaseMessages(caseId: string) {
  const router = useRouter()
  const [message, setMessage] = useState("")
  const [isSending, setIsSending] = useState(false)
  const [error, setError] = useState("")

  async function sendMessage(e: React.FormEvent) {
    e.preventDefault()
    if (!message.trim()) return

    setIsSending(true)
    setError("")
    try {
      await sendCaseMessage(caseId, message.trim())
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
