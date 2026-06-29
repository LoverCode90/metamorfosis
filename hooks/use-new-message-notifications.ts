"use client"

import { useEffect, useState } from "react"

interface UnreadCase {
  caseId: string
  orderId: string
}

const STORAGE_KEY = "notified-case-messages"

function alreadyNotified(caseId: string): boolean {
  if (typeof window === "undefined") return true
  const raw = sessionStorage.getItem(STORAGE_KEY)
  return raw ? (JSON.parse(raw) as string[]).includes(caseId) : false
}

function markNotified(caseId: string): void {
  const raw = sessionStorage.getItem(STORAGE_KEY)
  const ids = raw ? (JSON.parse(raw) as string[]) : []
  sessionStorage.setItem(STORAGE_KEY, JSON.stringify([...ids, caseId]))
}

/**
 * Fetches unread support messages once on mount and surfaces the first case the
 * user hasn't been notified about this session. Returns the pending case plus a
 * dismiss handler. Logic lives here so the toast component stays presentational.
 */
export function useNewMessageNotifications() {
  const [pending, setPending] = useState<UnreadCase | null>(null)

  useEffect(() => {
    let active = true
    async function check() {
      const res = await fetch("/api/profile/cases/unread")
      if (!res.ok || !active) return
      const data = (await res.json()) as { unread?: UnreadCase[] }
      const next = (data.unread ?? []).find(
        (item) => !alreadyNotified(item.caseId),
      )
      if (next && active) {
        markNotified(next.caseId)
        setPending(next)
      }
    }
    check()
    return () => {
      active = false
    }
  }, [])

  return { pending, dismiss: () => setPending(null) }
}
