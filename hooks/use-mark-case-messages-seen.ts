"use client"

import { useEffect } from "react"

import { markCaseMessagesNotified } from "@/lib/support/message-notifications"

/** Marks case messages as notified when the customer opens the thread. */
export function useMarkCaseMessagesSeen(messageIdsKey: string) {
  useEffect(() => {
    const messageIds = messageIdsKey.split(",").filter(Boolean)
    markCaseMessagesNotified(messageIds)
  }, [messageIdsKey])
}
