import { memo } from "react"

import { cn } from "@/lib/utils"

interface MessageBubbleProps {
  text: string
  createdAt: string
  /** True when the message was sent by the current viewer. */
  mine: boolean
  /** Sender label shown above incoming messages (e.g. "Support"). */
  label: string
}

/**
 * Chat bubble shared by the customer and admin case threads. The viewer's own
 * messages are dark and right-aligned; incoming messages are muted, left-
 * aligned, and labelled. Memoized — rendered in a list.
 */
export const MessageBubble = memo(function MessageBubble({
  text,
  createdAt,
  mine,
  label,
}: MessageBubbleProps) {
  return (
    <div className={cn("flex flex-col", mine ? "items-end" : "items-start")}>
      <div
        className={cn(
          "max-w-[80%] rounded-2xl px-4 py-2.5 text-sm leading-relaxed",
          mine
            ? "bg-foreground text-background rounded-br-sm"
            : "bg-muted text-foreground rounded-bl-sm",
        )}
      >
        {!mine && (
          <p className="text-muted-foreground mb-0.5 text-xs font-semibold">
            {label}
          </p>
        )}
        <p className="whitespace-pre-wrap">{text}</p>
      </div>
      <span className="text-muted-foreground mt-1 px-1 text-[10px]">
        {new Date(createdAt).toLocaleString()}
      </span>
    </div>
  )
})
