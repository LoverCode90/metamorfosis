"use client"

import { Loader2, Send } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { CaseMessageBubble } from "@/components/profile/case-message-bubble"
import { useCaseMessages } from "@/hooks/use-case-messages"
import type { CaseWithMessages } from "@/lib/cases/types"

/** Case message thread with a composer; disabled once the case is closed. */
export function CaseMessagesSection({
  caseData,
}: {
  caseData: CaseWithMessages
}) {
  const { message, setMessage, isSending, error, sendMessage } =
    useCaseMessages(caseData.id)
  const isClosed = caseData.status === "closed"
  const messages = caseData.case_messages ?? []

  return (
    <section className="border-border bg-card flex h-[500px] flex-col rounded-2xl border p-6">
      <h2 className="text-foreground mb-4 text-lg font-semibold">Messages</h2>

      <div className="mb-4 flex-1 space-y-4 overflow-y-auto pr-2">
        {messages.length === 0 ? (
          <p className="text-muted-foreground py-8 text-center text-sm">
            No messages yet. Send a message if you need further assistance.
          </p>
        ) : (
          messages.map((caseMessage) => (
            <CaseMessageBubble
              key={caseMessage.id}
              message={caseMessage}
              isCustomer={caseMessage.sender_id === caseData.customer_id}
            />
          ))
        )}
      </div>

      {error && (
        <p className="text-destructive mb-2 text-sm font-medium">{error}</p>
      )}

      <form
        onSubmit={sendMessage}
        className="border-border flex gap-2 border-t pt-4"
      >
        <Input
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder="Type your message..."
          disabled={isSending || isClosed}
          className="flex-1"
        />
        <Button
          type="submit"
          size="icon"
          disabled={!message.trim() || isSending || isClosed}
        >
          {isSending ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Send className="h-4 w-4" />
          )}
        </Button>
      </form>
    </section>
  )
}
