"use client"

import { useEffect, useRef, useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { ChevronLeft, Lock } from "lucide-react"

import { Button } from "@/components/ui/button"

export function AddCardView() {
  const router = useRouter()
  const cardContainerRef = useRef<HTMLDivElement>(null)
  const cardRef = useRef<unknown>(null)

  const [sdkReady, setSdkReady] = useState(false)
  const [sdkError, setSdkError] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [saving, setSaving] = useState(false)

  const appId =
    process.env.NEXT_PUBLIC_SQUARE_APPLICATION_ID ??
    process.env.NEXT_PUBLIC_SQUARE_APP_ID ??
    ""
  const locationId = process.env.NEXT_PUBLIC_SQUARE_LOCATION_ID ?? ""

  useEffect(() => {
    async function initCard() {
      if (!window.Square || !cardContainerRef.current) return
      if (!appId || !locationId) {
        setSdkError("Square credentials missing.")
        return
      }
      try {
        const payments = window.Square.payments(appId, locationId)
        const card = await payments.card({
          style: {
            input: {
              color: "#f4f5f8",
              backgroundColor: "#070709",
              fontSize: "16px",
            },
            "input::placeholder": { color: "#68686f" },
            ".input-container": {
              borderColor: "#28292b",
              borderRadius: "8px",
            },
            ".input-container.is-focus": { borderColor: "#4361ee" },
            ".input-container.is-error": { borderColor: "#f9667a" },
          },
        })
        await card.attach(cardContainerRef.current)
        cardRef.current = card
        setSdkReady(true)
      } catch {
        setSdkError("Payment form failed to load.")
      }
    }

    if (window.Square) {
      initCard()
      return
    }

    const script = document.createElement("script")
    script.src = "https://web.squarecdn.com/v1/square.js"
    script.onload = initCard
    script.onerror = () => setSdkError("Failed to load Square SDK.")
    document.head.appendChild(script)
  }, [appId, locationId])

  async function handleSave() {
    if (!cardRef.current) return
    setSaving(true)
    setError(null)

    try {
      const card = cardRef.current as {
        tokenize: () => Promise<{
          status: string
          token?: string
          errors?: { message: string }[]
        }>
      }
      const result = await card.tokenize()
      if (result.status !== "OK") {
        setError(result.errors?.[0]?.message ?? "Card error.")
        return
      }

      const res = await fetch("/api/profile/cards/add", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ nonce: result.token }),
      })

      if (!res.ok) {
        const body = (await res.json()) as { error?: string }
        throw new Error(body.error ?? "Failed to save card")
      }

      router.replace("/profile/cards")
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to save card")
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="mx-auto max-w-2xl px-4 py-8 sm:px-6 lg:py-12">
      <Link
        href="/profile/cards"
        className="text-muted-foreground hover:text-foreground inline-flex items-center gap-1 text-sm font-medium transition-colors"
      >
        <ChevronLeft className="h-4 w-4" strokeWidth={1.75} />
        Payment Methods
      </Link>

      <div className="mt-4 flex flex-col gap-1">
        <h1 className="text-foreground text-2xl font-semibold tracking-tight">
          Add a card
        </h1>
        <p className="text-muted-foreground text-sm">
          Your card is tokenized by Square — we never see your card number.
        </p>
      </div>

      <div className="mt-8 space-y-6">
        {sdkError ? (
          <p className="border-destructive/30 bg-destructive/5 text-destructive rounded-lg border px-4 py-3 text-sm">
            {sdkError}
          </p>
        ) : (
          <div
            ref={cardContainerRef}
            className={`border-border bg-muted/20 min-h-25 w-full overflow-hidden rounded-lg border p-4 transition-opacity ${sdkReady ? "opacity-100" : "opacity-50"}`}
          />
        )}

        {!sdkReady && !sdkError && (
          <p className="text-muted-foreground text-xs">
            Loading secure payment form…
          </p>
        )}

        {error && (
          <p className="border-destructive/30 bg-destructive/5 text-destructive rounded-lg border px-4 py-3 text-sm">
            {error}
          </p>
        )}

        <Button
          variant="default"
          size="hero"
          className="w-full"
          onClick={handleSave}
          disabled={!sdkReady || saving}
        >
          <Lock className="h-4 w-4" strokeWidth={1.75} />
          {saving ? "Saving…" : "Save card"}
        </Button>
      </div>
    </div>
  )
}
