"use client"

import { useEffect, useState } from "react"

import {
  hasBeenNotifiedForMessage,
  markMessageNotified,
} from "@/lib/support/message-notifications"

interface UnreadCase {
  caseId: string
  orderId: string
  latestMessageId: string
}

/**
 * Surfaces at most one unread support reply per message id (persisted in
 * localStorage). Each admin message triggers a single toast, even across visits.
 */
export function useNewMessageNotifications() {
  const [pending, setPending] = useState<UnreadCase | null>(null)

  useEffect(() => {
    let active = true

    async function check() {
      const response = await fetch("/api/profile/cases/unread")
      if (!response.ok || !active) return

      const data = (await response.json()) as { unread?: UnreadCase[] }
      const next = (data.unread ?? []).find(
        (item) => !hasBeenNotifiedForMessage(item.latestMessageId),
      )

      if (next && active) {
        markMessageNotified(next.latestMessageId)
        setPending(next)
      }
    }

    check()
    return () => {
      active = false
    }
  }, [])

  function dismiss() {
    if (pending) {
      markMessageNotified(pending.latestMessageId)
    }
    setPending(null)
  }

  return { pending, dismiss }
}
