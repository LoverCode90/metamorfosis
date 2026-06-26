"use client"

import { useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { ChevronLeft, CreditCard, Trash2 } from "lucide-react"

export interface SavedCard {
  id: string
  brand: string | null
  last_four: string
  exp_month: number
  exp_year: number
  is_default: boolean
  created_at: string
  square_card_id: string
}

interface CardsViewProps {
  cards: SavedCard[]
  from: string | null
}

function isExpired(expMonth: number, expYear: number): boolean {
  const now = new Date()
  const year = now.getFullYear()
  const month = now.getMonth() + 1
  return expYear < year || (expYear === year && expMonth < month)
}

function formatExpiry(expMonth: number, expYear: number): string {
  return `${String(expMonth).padStart(2, "0")}/${expYear}`
}

export function CardsView({ cards: initialCards, from }: CardsViewProps) {
  const router = useRouter()
  const [cards, setCards] = useState<SavedCard[]>(initialCards)
  const [deletingId, setDeletingId] = useState<string | null>(null)
  const [defaultingId, setDefaultingId] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  async function handleDelete(id: string) {
    setDeletingId(id)
    setError(null)

    try {
      const res = await fetch(`/api/profile/cards/${id}`, { method: "DELETE" })
      if (!res.ok) {
        const body = (await res.json()) as { error?: string }
        throw new Error(body.error ?? "Failed to delete card")
      }
      setCards((prev) => prev.filter((c) => c.id !== id))
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to delete card")
    } finally {
      setDeletingId(null)
    }
  }

  async function handleSetDefault(id: string) {
    setDefaultingId(id)
    setError(null)

    try {
      const res = await fetch(`/api/profile/cards/${id}`, {
        method: "PUT",
      })
      if (!res.ok) {
        const body = (await res.json()) as { error?: string }
        throw new Error(body.error ?? "Failed to set default card")
      }
      setCards((prev) => prev.map((c) => ({ ...c, is_default: c.id === id })))
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to set default card",
      )
    } finally {
      setDefaultingId(null)
    }
  }

  return (
    <div className="mx-auto max-w-2xl px-4 py-8 sm:px-6 lg:py-12">
      {from === "payment" ? (
        <button
          type="button"
          onClick={() => router.back()}
          className="text-muted-foreground hover:text-foreground inline-flex items-center gap-1 text-sm font-medium transition-colors"
        >
          <ChevronLeft className="h-4 w-4" strokeWidth={1.75} />
          Return to payment
        </button>
      ) : (
        <Link
          href="/profile"
          className="text-muted-foreground hover:text-foreground inline-flex items-center gap-1 text-sm font-medium transition-colors"
        >
          <ChevronLeft className="h-4 w-4" strokeWidth={1.75} />
          Back to profile
        </Link>
      )}

      <div className="mt-4 flex flex-col gap-1">
        <h1 className="text-foreground text-2xl font-semibold tracking-tight">
          Payment Methods
        </h1>
        <p className="text-muted-foreground text-sm">
          Cards saved for faster checkout.
        </p>
      </div>

      <div className="mt-8 flex flex-col gap-3">
        {cards.length === 0 && (
          <p className="text-muted-foreground py-6 text-center text-sm">
            No saved cards yet.
          </p>
        )}

        {cards.map((card) => {
          const expired = isExpired(card.exp_month, card.exp_year)
          const isDeleting = deletingId === card.id
          const isDefaulting = defaultingId === card.id

          return (
            <div
              key={card.id}
              className="border-border bg-card flex items-center gap-4 rounded-2xl border p-4"
            >
              <span className="bg-muted flex h-11 w-11 shrink-0 items-center justify-center rounded-xl">
                <CreditCard
                  className="text-foreground h-5 w-5"
                  strokeWidth={1.75}
                />
              </span>

              <span className="min-w-0 flex-1">
                <span className="text-foreground flex items-center gap-2 text-sm font-semibold">
                  {card.brand ?? "Card"} ending in {card.last_four}
                  {card.is_default && (
                    <span className="bg-accent-violet/15 text-accent-violet rounded-full px-2 py-0.5 text-xs font-medium">
                      Default
                    </span>
                  )}
                  {expired && (
                    <span className="rounded-full bg-orange-500/15 px-2 py-0.5 text-xs font-medium text-orange-500">
                      Expired
                    </span>
                  )}
                </span>
                <span className="text-muted-foreground block text-xs">
                  Expires {formatExpiry(card.exp_month, card.exp_year)}
                </span>
                {!card.is_default && cards.length > 1 && (
                  <button
                    type="button"
                    onClick={() => handleSetDefault(card.id)}
                    disabled={isDefaulting}
                    className="text-muted-foreground hover:text-foreground mt-1 text-xs font-medium underline underline-offset-4 transition-colors disabled:opacity-50"
                  >
                    {isDefaulting ? "Setting…" : "Set as default"}
                  </button>
                )}
              </span>

              <button
                type="button"
                onClick={() => handleDelete(card.id)}
                disabled={isDeleting}
                aria-label={`Delete ${card.brand ?? "card"} ending in ${card.last_four}`}
                className="text-muted-foreground hover:text-destructive shrink-0 transition-colors disabled:opacity-50"
              >
                <Trash2 className="h-4 w-4" strokeWidth={1.75} />
              </button>
            </div>
          )
        })}
      </div>

      {error && (
        <p className="border-destructive/30 bg-destructive/5 text-destructive mt-4 rounded-lg border px-4 py-3 text-sm">
          {error}
        </p>
      )}

      <div className="mt-6">
        {cards.length >= 3 ? (
          <p className="text-muted-foreground text-sm">
            Delete a card to add a new one.
          </p>
        ) : (
          <Link
            href="/profile/cards/add"
            className="text-muted-foreground hover:text-foreground text-sm font-medium underline underline-offset-4 transition-colors"
          >
            Add payment method
          </Link>
        )}
      </div>
    </div>
  )
}
