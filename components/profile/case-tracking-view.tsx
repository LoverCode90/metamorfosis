"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Send, Loader2, ArrowLeft } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { cn } from "@/lib/utils"
import { formatCaseStatus } from "@/lib/utils/format"
import type { CaseWithMessages } from "@/lib/cases/types"
import Link from "next/link"

export function CaseTrackingView({ caseData }: { caseData: CaseWithMessages }) {
  const router = useRouter()
  const [message, setMessage] = useState("")
  const [isSending, setIsSending] = useState(false)
  const [error, setError] = useState("")

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!message.trim()) return

    setIsSending(true)
    setError("")

    try {
      const res = await fetch(`/api/profile/cases/${caseData.id}/messages`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: message.trim() }),
      })

      if (!res.ok) {
        const data = await res.json()
        throw new Error(data.error || "Failed to send message")
      }

      setMessage("")
      router.refresh()
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Something went wrong")
    } finally {
      setIsSending(false)
    }
  }

  return (
    <div className="mx-auto max-w-3xl px-4 py-8 sm:px-6 lg:py-12">
      <Link
        href="/orders"
        className="text-muted-foreground hover:text-foreground mb-6 inline-flex items-center gap-1.5 text-sm font-medium transition-colors"
      >
        <ArrowLeft className="h-4 w-4" strokeWidth={1.75} />
        Back to orders
      </Link>

      <div className="flex flex-col gap-1">
        <p className="text-muted-foreground text-xs font-medium tracking-[0.3em] uppercase">
          Case Support
        </p>
        <h1 className="text-foreground text-2xl font-semibold tracking-tight sm:text-3xl">
          Return / Issue #{caseData.id.slice(0, 8).toUpperCase()}
        </h1>
      </div>

      <div className="mt-8 grid gap-8 md:grid-cols-3">
        <div className="space-y-6 md:col-span-2">
          <section className="border-border bg-card rounded-2xl border p-6">
            <h2 className="text-foreground mb-4 text-lg font-semibold">
              Case Details
            </h2>
            <div className="space-y-4 text-sm">
              <div className="grid grid-cols-3 gap-4">
                <span className="text-muted-foreground">Status</span>
                <span className="col-span-2 font-medium">
                  {formatCaseStatus(caseData.status)}
                </span>
              </div>
              <div className="grid grid-cols-3 gap-4">
                <span className="text-muted-foreground">Reason</span>
                <span className="col-span-2">
                  {formatCaseStatus(caseData.reason)}
                </span>
              </div>
              <div className="grid grid-cols-3 gap-4">
                <span className="text-muted-foreground">Explanation</span>
                <span className="col-span-2 whitespace-pre-wrap">
                  {caseData.explanation}
                </span>
              </div>
            </div>

            {caseData.prepaid_label_url && (
              <div className="border-border mt-6 border-t pt-6">
                <h3 className="text-foreground mb-2 font-medium">
                  Return Label
                </h3>
                <p className="text-muted-foreground mb-4 text-sm">
                  Please print this label and attach it to your return package.
                </p>
                <a
                  href={caseData.prepaid_label_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="bg-foreground text-background hover:bg-foreground/90 inline-flex items-center justify-center rounded-md px-4 py-2 text-sm font-semibold transition-colors"
                >
                  Download Label
                </a>
              </div>
            )}
          </section>

          <section className="border-border bg-card flex h-[500px] flex-col rounded-2xl border p-6">
            <h2 className="text-foreground mb-4 text-lg font-semibold">
              Messages
            </h2>

            <div className="mb-4 flex-1 space-y-4 overflow-y-auto pr-2">
              {caseData.case_messages?.length === 0 ? (
                <p className="text-muted-foreground py-8 text-center text-sm">
                  No messages yet. Send a message if you need further
                  assistance.
                </p>
              ) : (
                caseData.case_messages?.map((msg) => {
                  const isCustomer = msg.sender_id === caseData.customer_id
                  return (
                    <div
                      key={msg.id}
                      className={cn(
                        "flex max-w-[80%] flex-col rounded-2xl px-4 py-2",
                        isCustomer
                          ? "bg-foreground text-background ml-auto self-end rounded-br-sm"
                          : "bg-muted text-foreground mr-auto self-start rounded-bl-sm",
                      )}
                    >
                      <p className="text-sm whitespace-pre-wrap">
                        {msg.message}
                      </p>
                      <span
                        className={cn(
                          "mt-1 text-[10px]",
                          isCustomer
                            ? "text-background/70"
                            : "text-muted-foreground",
                        )}
                      >
                        {new Date(msg.created_at).toLocaleString()}
                      </span>
                    </div>
                  )
                })
              )}
            </div>

            {error && (
              <p className="text-destructive mb-2 text-sm font-medium">
                {error}
              </p>
            )}

            <form
              onSubmit={handleSendMessage}
              className="border-border flex gap-2 border-t pt-4"
            >
              <Input
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Type your message..."
                disabled={isSending || caseData.status === "closed"}
                className="flex-1"
              />
              <Button
                type="submit"
                size="icon"
                disabled={
                  !message.trim() || isSending || caseData.status === "closed"
                }
              >
                {isSending ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Send className="h-4 w-4" />
                )}
              </Button>
            </form>
          </section>
        </div>

        <div className="space-y-6">
          <section className="border-border bg-card rounded-2xl border p-6">
            <h2 className="text-foreground mb-4 text-sm font-semibold">
              Timeline
            </h2>
            <div className="before:via-border relative space-y-6 before:absolute before:inset-0 before:ml-2 before:h-full before:w-0.5 before:-translate-x-px before:bg-gradient-to-b before:from-transparent before:to-transparent md:before:mx-auto md:before:translate-x-0">
              <div className="group is-active relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse">
                <div className="border-foreground bg-background flex h-4 w-4 shrink-0 items-center justify-center rounded-full border-2 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2" />
                <div className="ml-4 w-[calc(100%-2rem)] md:ml-0 md:w-[calc(50%-1.5rem)] md:group-odd:text-right">
                  <p className="text-foreground text-sm font-medium">
                    Case Opened
                  </p>
                  <p className="text-muted-foreground text-xs">
                    {new Date(caseData.created_at).toLocaleDateString()}
                  </p>
                </div>
              </div>
              {caseData.resolved_at && (
                <div className="group is-active relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse">
                  <div className="border-foreground bg-background flex h-4 w-4 shrink-0 items-center justify-center rounded-full border-2 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2" />
                  <div className="ml-4 w-[calc(100%-2rem)] md:ml-0 md:w-[calc(50%-1.5rem)] md:group-odd:text-right">
                    <p className="text-foreground text-sm font-medium">
                      Case Resolved
                    </p>
                    <p className="text-muted-foreground text-xs">
                      {new Date(caseData.resolved_at).toLocaleDateString()}
                    </p>
                  </div>
                </div>
              )}
            </div>
          </section>
        </div>
      </div>
    </div>
  )
}
