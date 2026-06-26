"use client"

import Link from "next/link"
import { useRouter } from "next/navigation"
import { ChevronLeft } from "lucide-react"

import { Button } from "@/components/ui/button"
import { SavedCardItem } from "@/components/profile/saved-card-item"
import { useSavedCards } from "@/hooks/use-saved-cards"
import type { SavedCard } from "@/lib/profile/cards-api"

export type { SavedCard }

interface CardsViewProps {
  cards: SavedCard[]
}

export function CardsView({ cards: initialCards }: CardsViewProps) {
  const router = useRouter()
  const { cards, error, deletingId, deleteCard } = useSavedCards(initialCards)

  async function handleReplaceCard() {
    if (cards.length === 0) return
    await deleteCard(cards[0].id)
    router.push("/profile/cards/add")
  }

  return (
    <div className="mx-auto max-w-2xl px-4 py-8 sm:px-6 lg:py-12">
      <Button
        variant="ghost"
        size="sm"
        nativeButton={false}
        render={<Link href="/profile" />}
        className="text-muted-foreground"
      >
        <ChevronLeft className="h-4 w-4" strokeWidth={1.75} />
        Back to profile
      </Button>

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

        {cards.map((card) => (
          <SavedCardItem
            key={card.id}
            card={card}
            isDeleting={deletingId === card.id}
            onDelete={deleteCard}
          />
        ))}
      </div>

      {error && (
        <p className="border-destructive/30 bg-destructive/5 text-destructive mt-4 rounded-lg border px-4 py-3 text-sm">
          {error}
        </p>
      )}

      <div className="mt-6">
        {cards.length >= 1 ? (
          <Button
            variant="link"
            size="sm"
            onClick={handleReplaceCard}
            disabled={!!deletingId}
            className="text-muted-foreground h-auto p-0"
          >
            {deletingId ? "Removing…" : "Replace card"}
          </Button>
        ) : (
          <Button
            variant="link"
            size="sm"
            nativeButton={false}
            render={<Link href="/profile/cards/add" />}
            className="text-muted-foreground h-auto p-0"
          >
            Add payment method
          </Button>
        )}
      </div>
    </div>
  )
}
