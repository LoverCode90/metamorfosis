"use client"

import { useRef, useState } from "react"
import type { User } from "@supabase/supabase-js"
import { usePlacesAutocomplete } from "@/hooks/use-places-autocomplete"
import type { SavedAddress } from "@/lib/types"
import { formatPhone, digits as phoneDigits } from "@/lib/utils/phone"
import { useAddressStore } from "@/stores/profile"
import {
  EMPTY_ADDRESS_DRAFT,
  REQUIRED_ADDRESS_FIELDS,
  ADDRESS_FIELD_LABELS,
  parsePlaceResult,
  type AddressDraft,
  type FieldErrors,
} from "@/lib/profile/address-helper"

interface UseProfileAddressArgs {
  savedAddress: SavedAddress | null
  saveAddress: (address: SavedAddress) => void
  user: User | null
  email: string
}

export function useProfileAddress({
  savedAddress,
  saveAddress,
  user,
  email,
}: UseProfileAddressArgs) {
  const { clearAddress } = useAddressStore()
  const [editing, setEditing] = useState(false)
  const [draft, setDraft] = useState<AddressDraft>(EMPTY_ADDRESS_DRAFT)
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({})
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)
  const originalRef = useRef<AddressDraft>(EMPTY_ADDRESS_DRAFT)
  const { suggestions, getPlaceDetails, setSuggestions } =
    usePlacesAutocomplete(draft.line1)

  async function handlePlaceSelect(placeId: string) {
    try {
      const details = await getPlaceDetails(placeId)
      setDraft((currentDraft) => ({
        ...currentDraft,
        ...parsePlaceResult(details.address_components),
      }))
      setSuggestions([])
    } catch (error) {
      console.error(error)
    }
  }

  function handleEditStart() {
    const init: AddressDraft = {
      fullName: savedAddress?.fullName ?? "",
      phone: phoneDigits(savedAddress?.phone ?? ""),
      line1: savedAddress?.line1 ?? "",
      city: savedAddress?.city ?? "",
      region: savedAddress?.region ?? "",
      postalCode: savedAddress?.postalCode ?? "",
      country: "US",
    }
    originalRef.current = init
    setDraft(init)
    setFieldErrors({})
    setEditing(true)
  }

  function handleCancel() {
    setDraft(originalRef.current)
    setFieldErrors({})
    setEditing(false)
  }

  function handleSave() {
    const errors: FieldErrors = {}
    for (const key of REQUIRED_ADDRESS_FIELDS) {
      if (!draft[key]?.trim()) {
        errors[key] = `${ADDRESS_FIELD_LABELS[key]} is required.`
      }
    }
    if (Object.keys(errors).length > 0) {
      setFieldErrors(errors)
      return
    }
    const fmt = {
      ...draft,
      phone: draft.phone ? formatPhone(draft.phone) : "",
      country: "US",
    }
    saveAddress(fmt)
    setFieldErrors({})
    setEditing(false)
    if (user) {
      fetch("/api/addresses/default", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          fullName: fmt.fullName,
          email,
          phone: fmt.phone,
          streetLine1: fmt.line1,
          streetLine2: "",
          city: fmt.city,
          state: fmt.region,
          zip: fmt.postalCode,
          country: "US",
        }),
      }).catch(() => {})
    }
  }

  async function handleDelete() {
    setIsDeleting(true)
    try {
      await fetch("/api/addresses/default", { method: "DELETE" })
      clearAddress()
      setShowDeleteConfirm(false)
    } catch {
      /* non-blocking */
    }
    setIsDeleting(false)
  }

  return {
    editing,
    draft,
    setDraft,
    fieldErrors,
    showDeleteConfirm,
    setShowDeleteConfirm,
    isDeleting,
    suggestions,
    handlePlaceSelect,
    handleEditStart,
    handleCancel,
    handleSave,
    handleDelete,
  }
}
