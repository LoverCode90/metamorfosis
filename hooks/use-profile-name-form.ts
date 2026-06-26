"use client"

import { useState } from "react"

interface UseProfileNameFormArgs {
  initialFirstName: string
  initialLastName: string
  onSave: (firstName: string, lastName: string) => Promise<void>
}

export interface UseProfileNameFormResult {
  firstName: string
  setFirstName: (v: string) => void
  lastName: string
  setLastName: (v: string) => void
  saving: boolean
  saved: boolean
  /** True when names are non-empty and differ from the initial values. */
  canSave: boolean
  save: () => Promise<void>
}

/**
 * Local first/last-name edit state with dirty tracking and a save lifecycle.
 * @param args - Initial names and the persistence callback.
 */
export function useProfileNameForm({
  initialFirstName,
  initialLastName,
  onSave,
}: UseProfileNameFormArgs): UseProfileNameFormResult {
  const [firstName, setFirstName] = useState(initialFirstName)
  const [lastName, setLastName] = useState(initialLastName)
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)

  const dirty =
    firstName.trim() !== initialFirstName || lastName.trim() !== initialLastName
  const canSave =
    dirty && firstName.trim().length > 0 && lastName.trim().length > 0

  async function save() {
    if (!canSave) return
    setSaving(true)
    setSaved(false)
    await onSave(firstName.trim(), lastName.trim())
    setSaving(false)
    setSaved(true)
  }

  return {
    firstName,
    setFirstName,
    lastName,
    setLastName,
    saving,
    saved,
    canSave,
    save,
  }
}
