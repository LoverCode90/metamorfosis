import { memo } from "react"

import { cn } from "@/lib/utils"
import type { CaseWithMessages } from "@/lib/cases/types"

type CaseMessage = NonNullable<CaseWithMessages["case_messages"]>[number]

const MESSAGE_BUBBLE_STYLES = {
  customer: "bg-foreground text-background ml-auto self-end rounded-br-sm",
  support: "bg-muted text-foreground mr-auto self-start rounded-bl-sm",
} as const

const MESSAGE_TIMESTAMP_STYLES = {
  customer: "text-background/70",
  support: "text-muted-foreground",
} as const

interface CaseMessageBubbleProps {
  message: CaseMessage
  isCustomer: boolean
}

/** A single chat bubble in the case thread (memoized — rendered in a list). */
export const CaseMessageBubble = memo(function CaseMessageBubble({
  message,
  isCustomer,
}: CaseMessageBubbleProps) {
  const variant = isCustomer ? "customer" : "support"

  return (
    <div
      className={cn(
        "flex max-w-[80%] flex-col rounded-2xl px-4 py-2",
        MESSAGE_BUBBLE_STYLES[variant],
      )}
    >
      <p className="text-sm whitespace-pre-wrap">{message.message}</p>
      <span
        className={cn("mt-1 text-[10px]", MESSAGE_TIMESTAMP_STYLES[variant])}
      >
        {new Date(message.created_at).toLocaleString()}
      </span>
    </div>
  )
})
