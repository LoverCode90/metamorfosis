"use client"

import { useMemo } from "react"

import { CaseChatPanel } from "@/components/cases/case-chat-panel"
import { useCaseMessages } from "@/hooks/use-case-messages"
import { useMarkCaseMessagesSeen } from "@/hooks/use-mark-case-messages-seen"
import {
  isCaseMessagingLocked,
  messagingLockedMessage,
} from "@/lib/cases/messaging"
import type { CaseWithMessages } from "@/lib/cases/types"

/** Customer case thread; marks support messages as seen when opened. */
export function CaseMessagesSection({
  caseData,
}: {
  caseData: CaseWithMessages
}) {
  const { message, setMessage, isSending, error, sendMessage } =
    useCaseMessages(caseData.id)

  const messageIdsKey = useMemo(
    () =>
      (caseData.case_messages ?? [])
        .map((caseMessage) => caseMessage.id)
        .join(","),
    [caseData.case_messages],
  )
  useMarkCaseMessagesSeen(messageIdsKey)

  const isLocked = isCaseMessagingLocked(caseData)
  const messages = caseData.case_messages ?? []

  return (
    <CaseChatPanel
      messages={messages}
      isMine={(caseMessage) => caseMessage.sender_id === caseData.customer_id}
      peerLabel="Support"
      isLocked={isLocked}
      lockedMessage={messagingLockedMessage(caseData)}
      message={message}
      onMessageChange={setMessage}
      isSending={isSending}
      error={error}
      onSend={sendMessage}
    />
  )
}
