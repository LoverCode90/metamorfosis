import { cn } from "@/lib/utils"
import type { AdminCaseDetail, DbCaseMessage } from "@/lib/cases/types"

/** A single message bubble, aligned by author. */
function MessageBubble({
  message,
  isAdmin,
  customerName,
}: {
  message: DbCaseMessage
  isAdmin: boolean
  customerName?: string
}) {
  return (
    <div
      className={cn(
        "flex max-w-[80%] flex-col rounded-2xl px-4 py-2",
        isAdmin
          ? "bg-foreground text-background ml-auto self-end rounded-br-sm"
          : "bg-muted text-foreground mr-auto self-start rounded-bl-sm",
      )}
    >
      <p className="mb-1 text-sm font-semibold opacity-70">
        {isAdmin ? "Admin Support" : customerName}
      </p>
      <p className="text-sm whitespace-pre-wrap">{message.message}</p>
      <span
        className={cn(
          "mt-1 text-[10px]",
          isAdmin ? "text-background/70" : "text-muted-foreground",
        )}
      >
        {new Date(message.created_at).toLocaleString()}
      </span>
    </div>
  )
}

/** The case message thread, sorted oldest-first. */
export function CaseMessageThread({ caseData }: { caseData: AdminCaseDetail }) {
  const messages = [...(caseData.case_messages ?? [])].sort(
    (a, b) =>
      new Date(a.created_at).getTime() - new Date(b.created_at).getTime(),
  )

  return (
    <section className="border-border bg-card flex min-h-[400px] flex-col rounded-2xl border p-6">
      <h2 className="text-foreground mb-4 text-lg font-semibold">Messages</h2>
      <div className="flex-1 space-y-4">
        {messages.length === 0 ? (
          <p className="text-muted-foreground text-sm">
            No messages in this case.
          </p>
        ) : (
          messages.map((message) => (
            <MessageBubble
              key={message.id}
              message={message}
              isAdmin={message.sender_id !== caseData.profiles?.id}
              customerName={caseData.profiles?.full_name}
            />
          ))
        )}
      </div>
    </section>
  )
}
