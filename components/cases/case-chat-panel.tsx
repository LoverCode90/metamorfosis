"use client"

import {
  useEffect,
  useRef,
  useState,
  type FormEvent,
  type ReactNode,
} from "react"
import { Loader2, MessageSquare, Send } from "lucide-react"

import { MessageBubble } from "@/components/cases/message-bubble"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { cn } from "@/lib/utils"
import type { DbCaseMessage } from "@/lib/cases/types"

interface CaseChatPanelProps {
  messages: DbCaseMessage[]
  isMine: (message: DbCaseMessage) => boolean
  peerLabel: string
  isLocked: boolean
  lockedMessage: string
  message: string
  onMessageChange: (value: string) => void
  isSending: boolean
  error?: string
  onSend: (event: FormEvent) => void
  headerAction?: ReactNode
  className?: string
}

function sortMessages(messages: DbCaseMessage[]): DbCaseMessage[] {
  return [...messages].sort(
    (left, right) =>
      new Date(left.created_at).getTime() -
      new Date(right.created_at).getTime(),
  )
}

/**
 * Shared support chat layout for admin and customer case threads. Uses shadcn
 * Textarea + Button with a scrollable message list.
 */
export function CaseChatPanel({
  messages,
  isMine,
  peerLabel,
  isLocked,
  lockedMessage,
  message,
  onMessageChange,
  isSending,
  error,
  onSend,
  headerAction,
  className,
}: CaseChatPanelProps) {
  const bottomRef = useRef<HTMLDivElement>(null)
  const [composerFocused, setComposerFocused] = useState(false)
  const sortedMessages = sortMessages(messages)

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [sortedMessages.length])

  return (
    <section
      className={cn(
        "border-border bg-card flex min-h-[min(520px,70dvh)] flex-col overflow-hidden rounded-2xl border",
        className,
      )}
    >
      <header className="border-border/60 flex items-start justify-between gap-3 border-b px-4 py-4 sm:px-5">
        <div className="flex min-w-0 items-start gap-3">
          <div className="bg-primary/15 text-primary border-primary/20 flex size-10 shrink-0 items-center justify-center rounded-xl border">
            <MessageSquare className="size-4.5" strokeWidth={1.75} />
          </div>
          <div className="min-w-0">
            <h2 className="text-foreground text-sm font-semibold tracking-tight">
              Case conversation
            </h2>
            <p className="text-muted-foreground mt-0.5 text-xs">
              {isLocked
                ? "Read-only thread"
                : "Messages with support in real time"}
            </p>
          </div>
        </div>
        {headerAction}
      </header>

      <div className="min-h-0 flex-1 overflow-y-auto px-4 py-4 sm:px-5">
        {sortedMessages.length === 0 ? (
          <div className="flex h-full min-h-[200px] flex-col items-center justify-center text-center">
            <p className="text-muted-foreground text-sm">No messages yet.</p>
            {!isLocked && (
              <p className="text-muted-foreground mt-1 max-w-xs text-xs">
                Send a message below to start the conversation.
              </p>
            )}
          </div>
        ) : (
          <div className="space-y-4">
            {sortedMessages.map((caseMessage) => (
              <MessageBubble
                key={caseMessage.id}
                text={caseMessage.message}
                createdAt={caseMessage.created_at}
                mine={isMine(caseMessage)}
                label={peerLabel}
              />
            ))}
          </div>
        )}
        <div ref={bottomRef} />
      </div>

      <footer className="border-border/60 border-t px-4 py-4 sm:px-5">
        {error && (
          <p className="text-destructive mb-3 text-sm font-medium">{error}</p>
        )}

        {isLocked ? (
          <p className="text-muted-foreground text-sm">{lockedMessage}</p>
        ) : (
          <form onSubmit={onSend} className="flex items-end gap-2 sm:gap-3">
            <Textarea
              value={message}
              onChange={(event) => onMessageChange(event.target.value)}
              onFocus={() => setComposerFocused(true)}
              onBlur={() => setComposerFocused(false)}
              placeholder="Type your message..."
              disabled={isSending}
              rows={composerFocused ? 3 : 1}
              className="max-h-32 min-h-11 resize-none py-2.5 text-sm leading-snug"
              onKeyDown={(event) => {
                if (event.key === "Enter" && !event.shiftKey) {
                  event.preventDefault()
                  event.currentTarget.form?.requestSubmit()
                }
              }}
            />
            <Button
              type="submit"
              size="icon"
              className="size-11 shrink-0"
              disabled={!message.trim() || isSending}
            >
              {isSending ? (
                <Loader2 className="size-4 animate-spin" />
              ) : (
                <Send className="size-4" />
              )}
            </Button>
          </form>
        )}
      </footer>
    </section>
  )
}
