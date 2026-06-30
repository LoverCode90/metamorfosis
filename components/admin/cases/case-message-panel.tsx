"use client"

import { useState } from "react"
import { Lock } from "lucide-react"

import { CaseChatPanel } from "@/components/cases/case-chat-panel"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { useAdminCaseMessages } from "@/hooks/use-admin-case-messages"
import { useAdminCloseChat } from "@/hooks/use-admin-close-chat"
import {
  isCaseMessagingLocked,
  messagingLockedMessage,
} from "@/lib/cases/messaging"
import type { AdminCaseDetail } from "@/lib/cases/types"

/** Admin case thread with optional close-chat action. */
export function CaseMessagePanel({ caseData }: { caseData: AdminCaseDetail }) {
  const { message, setMessage, isSending, error, sendMessage } =
    useAdminCaseMessages(caseData.id)
  const {
    closeChat,
    isClosing,
    error: closeError,
  } = useAdminCloseChat(caseData.id)
  const [confirmOpen, setConfirmOpen] = useState(false)

  const isLocked = isCaseMessagingLocked(caseData)
  const canCloseChat = !isLocked
  const customerId = caseData.profiles?.id ?? ""
  const customerName = caseData.profiles?.full_name ?? "Customer"

  async function handleCloseChat() {
    await closeChat()
    setConfirmOpen(false)
  }

  const headerAction = canCloseChat ? (
    <Dialog open={confirmOpen} onOpenChange={setConfirmOpen}>
      <DialogTrigger
        render={
          <Button variant="outline" size="sm" className="shrink-0 gap-1.5" />
        }
      >
        <Lock className="size-3.5" />
        Close chat
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Close this conversation?</DialogTitle>
          <DialogDescription>
            The customer will no longer be able to send messages in this case.
            You can still review the thread and resolve the case separately.
          </DialogDescription>
        </DialogHeader>
        {closeError && (
          <p className="text-destructive text-sm font-medium">{closeError}</p>
        )}
        <DialogFooter className="gap-2 sm:gap-0">
          <Button
            type="button"
            variant="ghost"
            onClick={() => setConfirmOpen(false)}
            disabled={isClosing}
          >
            Cancel
          </Button>
          <Button
            type="button"
            variant="destructive"
            onClick={handleCloseChat}
            disabled={isClosing}
          >
            {isClosing ? "Closing…" : "Close chat"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  ) : null

  return (
    <CaseChatPanel
      messages={caseData.case_messages ?? []}
      isMine={(caseMessage) => caseMessage.sender_id !== customerId}
      peerLabel={customerName}
      isLocked={isLocked}
      lockedMessage={messagingLockedMessage(caseData)}
      message={message}
      onMessageChange={setMessage}
      isSending={isSending}
      error={error}
      onSend={sendMessage}
      headerAction={headerAction}
    />
  )
}
