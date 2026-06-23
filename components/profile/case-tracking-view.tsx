"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Send, Loader2, ArrowLeft } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { cn } from "@/lib/utils"
import Link from "next/link"

export function CaseTrackingView({ caseData }: { caseData: any }) {
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
    } catch (err: any) {
      setError(err.message)
    } finally {
      setIsSending(false)
    }
  }

  const formatStatus = (s: string) => s.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase())

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
        <div className="md:col-span-2 space-y-6">
          <section className="border-border bg-card rounded-2xl border p-6">
            <h2 className="text-foreground text-lg font-semibold mb-4">Case Details</h2>
            <div className="space-y-4 text-sm">
              <div className="grid grid-cols-3 gap-4">
                <span className="text-muted-foreground">Status</span>
                <span className="col-span-2 font-medium">{formatStatus(caseData.status)}</span>
              </div>
              <div className="grid grid-cols-3 gap-4">
                <span className="text-muted-foreground">Reason</span>
                <span className="col-span-2">{formatStatus(caseData.reason)}</span>
              </div>
              <div className="grid grid-cols-3 gap-4">
                <span className="text-muted-foreground">Explanation</span>
                <span className="col-span-2 whitespace-pre-wrap">{caseData.explanation}</span>
              </div>
            </div>
            
            {caseData.prepaid_label_url && (
              <div className="mt-6 pt-6 border-t border-border">
                <h3 className="text-foreground font-medium mb-2">Return Label</h3>
                <p className="text-muted-foreground text-sm mb-4">
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

          <section className="border-border bg-card rounded-2xl border p-6 flex flex-col h-[500px]">
            <h2 className="text-foreground text-lg font-semibold mb-4">Messages</h2>
            
            <div className="flex-1 overflow-y-auto space-y-4 mb-4 pr-2">
              {caseData.case_messages?.length === 0 ? (
                <p className="text-muted-foreground text-sm text-center py-8">
                  No messages yet. Send a message if you need further assistance.
                </p>
              ) : (
                caseData.case_messages?.map((msg: any) => {
                  const isCustomer = msg.sender_id === caseData.customer_id
                  return (
                    <div
                      key={msg.id}
                      className={cn(
                        "flex flex-col max-w-[80%] rounded-2xl px-4 py-2",
                        isCustomer
                          ? "bg-foreground text-background self-end ml-auto rounded-br-sm"
                          : "bg-muted text-foreground self-start mr-auto rounded-bl-sm"
                      )}
                    >
                      <p className="text-sm whitespace-pre-wrap">{msg.message}</p>
                      <span className={cn(
                        "text-[10px] mt-1",
                        isCustomer ? "text-background/70" : "text-muted-foreground"
                      )}>
                        {new Date(msg.created_at).toLocaleString()}
                      </span>
                    </div>
                  )
                })
              )}
            </div>

            {error && (
              <p className="text-destructive text-sm font-medium mb-2">{error}</p>
            )}

            <form onSubmit={handleSendMessage} className="flex gap-2 pt-4 border-t border-border">
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
                disabled={!message.trim() || isSending || caseData.status === "closed"}
              >
                {isSending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
              </Button>
            </form>
          </section>
        </div>

        <div className="space-y-6">
          <section className="border-border bg-card rounded-2xl border p-6">
            <h2 className="text-foreground text-sm font-semibold mb-4">Timeline</h2>
            <div className="space-y-6 relative before:absolute before:inset-0 before:ml-2 before:-translate-x-px md:before:mx-auto md:before:translate-x-0 before:h-full before:w-0.5 before:bg-gradient-to-b before:from-transparent before:via-border before:to-transparent">
              <div className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group is-active">
                <div className="flex items-center justify-center w-4 h-4 rounded-full border-2 border-foreground bg-background shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2" />
                <div className="w-[calc(100%-2rem)] md:w-[calc(50%-1.5rem)] ml-4 md:ml-0 md:group-odd:text-right">
                  <p className="text-sm font-medium text-foreground">Case Opened</p>
                  <p className="text-xs text-muted-foreground">{new Date(caseData.created_at).toLocaleDateString()}</p>
                </div>
              </div>
              {caseData.resolved_at && (
                <div className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group is-active">
                  <div className="flex items-center justify-center w-4 h-4 rounded-full border-2 border-foreground bg-background shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2" />
                  <div className="w-[calc(100%-2rem)] md:w-[calc(50%-1.5rem)] ml-4 md:ml-0 md:group-odd:text-right">
                    <p className="text-sm font-medium text-foreground">Case Resolved</p>
                    <p className="text-xs text-muted-foreground">{new Date(caseData.resolved_at).toLocaleDateString()}</p>
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
