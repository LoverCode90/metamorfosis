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

/** Deletes a saved card. Throws with the server message on failure. */
export async function deleteCard(id: string): Promise<void> {
  const res = await fetch(`/api/profile/cards/${id}`, { method: "DELETE" })
  if (!res.ok) {
    const body = (await res.json()) as { error?: string }
    throw new Error(body.error ?? "Failed to delete card")
  }
}

/** Marks a saved card as the default. Throws with the server message on failure. */
export async function setDefaultCard(id: string): Promise<void> {
  const res = await fetch(`/api/profile/cards/${id}`, { method: "PUT" })
  if (!res.ok) {
    const body = (await res.json()) as { error?: string }
    throw new Error(body.error ?? "Failed to set default card")
  }
}
