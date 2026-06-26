"use client"

import { useCallback, useState } from "react"

import {
  deleteCard as deleteCardApi,
  type SavedCard,
} from "@/lib/profile/cards-api"

/**
 * Manages the saved-cards list with optimistic delete. Callback is stable so
 * the memoized {@link SavedCardItem} can skip re-renders.
 * @param initialCards - Server-rendered cards.
 */
export function useSavedCards(initialCards: SavedCard[]) {
  const [cards, setCards] = useState<SavedCard[]>(initialCards)
  const [deletingId, setDeletingId] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  const deleteCard = useCallback(async (id: string) => {
    setDeletingId(id)
    setError(null)
    try {
      await deleteCardApi(id)
      setCards((prev) => prev.filter((card) => card.id !== id))
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to delete card")
    } finally {
      setDeletingId(null)
    }
  }, [])

  return { cards, error, deletingId, deleteCard }
}
