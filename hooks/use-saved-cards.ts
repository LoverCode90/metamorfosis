"use client"

import { useCallback, useState } from "react"

import {
  deleteCard as deleteCardApi,
  setDefaultCard as setDefaultCardApi,
  type SavedCard,
} from "@/lib/profile/cards-api"

/**
 * Manages the saved-cards list with optimistic updates: delete a card and set
 * a default, tracking the in-flight id and any error. Callbacks are stable so
 * the memoized {@link SavedCardItem} can skip re-renders.
 * @param initialCards - Server-rendered cards.
 */
export function useSavedCards(initialCards: SavedCard[]) {
  const [cards, setCards] = useState<SavedCard[]>(initialCards)
  const [deletingId, setDeletingId] = useState<string | null>(null)
  const [defaultingId, setDefaultingId] = useState<string | null>(null)
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

  const setDefaultCard = useCallback(async (id: string) => {
    setDefaultingId(id)
    setError(null)
    try {
      await setDefaultCardApi(id)
      setCards((prev) =>
        prev.map((card) => ({ ...card, is_default: card.id === id })),
      )
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to set default card",
      )
    } finally {
      setDefaultingId(null)
    }
  }, [])

  return { cards, error, deletingId, defaultingId, deleteCard, setDefaultCard }
}
