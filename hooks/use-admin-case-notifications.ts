"use client"

import { useCallback, useEffect, useState } from "react"

export interface AdminCaseNotification {
  caseId: string
  caseNumber: string
  customerName: string
  messagePreview: string
  createdAt: string
  latestMessageId: string
}

/** Polls for cases where the customer sent the latest message. */
export function useAdminCaseNotifications() {
  const [notifications, setNotifications] = useState<AdminCaseNotification[]>(
    [],
  )
  const [isLoading, setIsLoading] = useState(true)

  const refresh = useCallback(async () => {
    try {
      const response = await fetch("/api/admin/notifications/case-messages")
      if (!response.ok) return
      const data = (await response.json()) as {
        notifications?: AdminCaseNotification[]
      }
      setNotifications(data.notifications ?? [])
    } finally {
      setIsLoading(false)
    }
  }, [])

  useEffect(() => {
    refresh()
    const interval = window.setInterval(refresh, 60_000)
    return () => window.clearInterval(interval)
  }, [refresh])

  return { notifications, count: notifications.length, isLoading, refresh }
}
