"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"

interface UseCaseActionsArgs {
  caseId: string
  customerEmail: string
  caseNumber: string
}

export interface UseCaseActionsResult {
  isProcessing: string | null
  error: string
  approve: (resolution: string) => Promise<boolean>
  reject: (resolution: string) => Promise<boolean>
  requestMoreInfo: () => Promise<void>
}

/**
 * Admin case-resolution actions: approve, reject, and request-more-info. Each
 * call hits its API route, refreshes the page on success, and surfaces a
 * friendly error otherwise. "Request more info" also opens the admin's mail
 * client (Zoho) via a mailto link.
 */
export function useCaseActions({
  caseId,
  customerEmail,
  caseNumber,
}: UseCaseActionsArgs): UseCaseActionsResult {
  const router = useRouter()
  const [isProcessing, setIsProcessing] = useState<string | null>(null)
  const [error, setError] = useState("")

  async function post(action: string, body?: unknown): Promise<boolean> {
    setIsProcessing(action)
    setError("")
    try {
      const res = await fetch(`/api/admin/cases/${caseId}/${action}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body ?? {}),
      })
      if (!res.ok) {
        const data = await res.json().catch(() => ({}))
        throw new Error(data.error || `Failed to ${action}`)
      }
      router.refresh()
      return true
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Something went wrong")
      return false
    } finally {
      setIsProcessing(null)
    }
  }

  function openMailto(): void {
    // The store owner operates in Spanish, so pre-fill a Spanish message.
    const subject = `Tu caso #${caseNumber} — Metamorfosis`
    const body = `Hola, necesitamos más información sobre tu caso #${caseNumber}. Por favor responde a este correo con los detalles solicitados.`
    window.location.href = `mailto:${customerEmail}?subject=${encodeURIComponent(
      subject,
    )}&body=${encodeURIComponent(body)}`
  }

  return {
    isProcessing,
    error,
    approve: (resolution) => post("approve", { resolution }),
    reject: (resolution) => post("reject", { resolution }),
    requestMoreInfo: async () => {
      openMailto()
      await post("request-info")
    },
  }
}
