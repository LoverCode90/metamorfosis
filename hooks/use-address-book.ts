"use client"

import { useState } from "react"

import { shippingFor } from "@/lib/checkout"
import type { SavedAddress } from "@/lib/checkout"

const EMPTY: SavedAddress = {
  fullName: "",
  line1: "",
  city: "",
  region: "",
  postalCode: "",
  country: "United States",
}

export interface UseAddressBookResult {
  editing: boolean
  draft: SavedAddress
  setField: (key: keyof SavedAddress, value: string) => void
  startEdit: () => void
  cancelEdit: () => void
  save: () => void
  /** Estimated shipping for the draft's country, in cents. */
  shipping: number
}

/**
 * Manages the shipping-address card: edit-mode toggle, the working draft, and
 * a validated save. Starts in edit mode when no address exists yet.
 * @param address - The current saved address, or null.
 * @param onSave - Persists a valid address.
 */
export function useAddressBook(
  address: SavedAddress | null,
  onSave: (address: SavedAddress) => void,
): UseAddressBookResult {
  const [editing, setEditing] = useState(address === null)
  const [draft, setDraft] = useState<SavedAddress>(address ?? EMPTY)

  function setField(key: keyof SavedAddress, value: string) {
    setDraft((d) => ({ ...d, [key]: value }))
  }

  function startEdit() {
    setDraft(address ?? EMPTY)
    setEditing(true)
  }

  function cancelEdit() {
    if (address) {
      setDraft(address)
      setEditing(false)
    }
  }

  function save() {
    if (
      !draft.fullName.trim() ||
      !draft.line1.trim() ||
      !draft.city.trim() ||
      !draft.country.trim()
    ) {
      return
    }
    onSave(draft)
    setEditing(false)
  }

  return {
    editing,
    draft,
    setField,
    startEdit,
    cancelEdit,
    save,
    shipping: shippingFor(draft.country),
  }
}
