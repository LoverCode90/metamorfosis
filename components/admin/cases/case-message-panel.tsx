"use client"

import { useEffect, useRef } from "react"
import { Loader2, Send } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { MessageBubble } from "@/components/cases/message-bubble"
import { useAdminCaseMessages } from "@/hooks/use-admin-case-messages"
import type { AdminCaseDetail } from "@/lib/cases/types"

const LOCKED_STATUSES = ["approved", "rejected", "closed", "fraud"]

/** Admin-side case thread with a composer; locked once the case is resolved. */
export function CaseMessagePanel({ caseData }: { caseData: AdminCaseDetail }) {
  const { message, setMessage, isSending, error, sendMessage } =
    useAdminCaseMessages(caseData.id)
  const bottomRef = useRef<HTMLDivElement>(null)

  const messages = [...(caseData.case_messages ?? [])].sort(
    (a, b) =>
      new Date(a.created_at).getTime() - new Date(b.created_at).getTime(),
  )
  const isLocked = LOCKED_STATUSES.includes(caseData.status)
  const customerId = caseData.profiles?.id
  const customerName = caseData.profiles?.full_name ?? "Customer"

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [messages.length])

  return (
    <section className="border-border bg-card flex min-h-[420px] flex-col rounded-2xl border p-6">
      <h2 className="text-foreground mb-4 text-lg font-semibold">Messages</h2>

      <div className="mb-4 flex-1 space-y-4 overflow-y-auto pr-1">
        {messages.length === 0 ? (
          <p className="text-muted-foreground py-8 text-center text-sm">
            No messages yet.
          </p>
        ) : (
          messages.map((msg) => (
            <MessageBubble
              key={msg.id}
              text={msg.message}
              createdAt={msg.created_at}
              mine={msg.sender_id !== customerId}
              label={customerName}
            />
          ))
        )}
        <div ref={bottomRef} />
      </div>

      {error && (
        <p className="text-destructive mb-2 text-sm font-medium">{error}</p>
      )}

      {isLocked ? (
        <p className="border-border text-muted-foreground border-t pt-4 text-sm">
          This case is resolved — messaging is disabled.
        </p>
      ) : (
        <form
          onSubmit={sendMessage}
          className="border-border flex gap-2 border-t pt-4"
        >
          <Input
            value={message}
            onChange={(event) => setMessage(event.target.value)}
            placeholder="Reply to the customer..."
            disabled={isSending}
            className="flex-1"
          />
          <Button
            type="submit"
            size="icon"
            disabled={!message.trim() || isSending}
          >
            {isSending ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Send className="h-4 w-4" />
            )}
          </Button>
        </form>
      )}
    </section>
  )
}
