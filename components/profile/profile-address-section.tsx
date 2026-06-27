"use client"

import { useRef, useState } from "react"
import type { User } from "@supabase/supabase-js"
import { Pencil, Trash2 } from "lucide-react"
import { usePlacesAutocomplete } from "@/hooks/use-places-autocomplete"
import type { SavedAddress } from "@/lib/types"
import { formatPhone, digits as phoneDigits } from "@/lib/utils/phone"
import { Button } from "@/components/ui/button"
import { useAddressStore } from "@/stores/profile"
import { DeleteAddressDialog } from "./delete-address-dialog"
import { ProfileAddressForm } from "./profile-address-form"

type AddressDraft = SavedAddress & { phone: string }
type FieldErrors = Partial<Record<keyof AddressDraft, string>>

const EMPTY: AddressDraft = {
  fullName: "",
  phone: "",
  line1: "",
  city: "",
  region: "",
  postalCode: "",
  country: "US",
}
const REQUIRED: (keyof AddressDraft)[] = [
  "fullName",
  "phone",
  "line1",
  "city",
  "region",
  "postalCode",
]
const LABELS: Partial<Record<keyof AddressDraft, string>> = {
  fullName: "Full name",
  phone: "Phone",
  line1: "Address line 1",
  city: "City",
  region: "State",
  postalCode: "ZIP code",
}

function parsePlaceResult(components: any[]) {
  let num = "",
    route = "",
    city = "",
    state = "",
    zip = ""
  for (const c of components ?? []) {
    if (c.types.includes("street_number")) num = c.long_name
    if (c.types.includes("route")) route = c.short_name
    if (c.types.includes("locality")) city = c.long_name
    if (c.types.includes("administrative_area_level_1")) state = c.short_name
    if (c.types.includes("postal_code")) zip = c.long_name
  }
  return {
    line1: `${num} ${route}`.trim(),
    city,
    region: state,
    postalCode: zip,
  }
}

interface ProfileAddressSectionProps {
  savedAddress: SavedAddress | null
  saveAddress: (address: SavedAddress) => void
  user: User | null
  email: string
}

export function ProfileAddressSection({
  savedAddress,
  saveAddress,
  user,
  email,
}: ProfileAddressSectionProps) {
  const { clearAddress } = useAddressStore()
  const [editing, setEditing] = useState(false)
  const [draft, setDraft] = useState<AddressDraft>(EMPTY)
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({})
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)
  const originalRef = useRef<AddressDraft>(EMPTY)
  const { suggestions, getPlaceDetails, setSuggestions } =
    usePlacesAutocomplete(draft.line1)

  async function handlePlaceSelect(placeId: string) {
    try {
      const details = await getPlaceDetails(placeId)
      setDraft((d) => ({
        ...d,
        ...parsePlaceResult(details.address_components),
      }))
      setSuggestions([])
    } catch (e) {
      console.error(e)
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
    for (const key of REQUIRED) {
      if (!draft[key]?.trim()) errors[key] = `${LABELS[key]} is required.`
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

  return (
    <section className="border-border bg-card rounded-2xl border p-6">
      <div className="flex items-center justify-between">
        <h3 className="text-foreground text-sm font-semibold">Saved Address</h3>
        {!editing && (
          <button
            type="button"
            onClick={handleEditStart}
            className="text-muted-foreground hover:text-foreground flex items-center gap-1 text-xs font-medium"
          >
            <Pencil className="h-3.5 w-3.5" strokeWidth={1.75} />
            {savedAddress ? "Edit" : "Add address"}
          </button>
        )}
      </div>

      {!editing ? (
        savedAddress ? (
          <>
            <address className="text-muted-foreground mt-4 flex flex-col gap-1 text-sm not-italic">
              <span className="text-foreground font-medium">
                {savedAddress.fullName}
              </span>
              {savedAddress.phone && (
                <span>{formatPhone(savedAddress.phone)}</span>
              )}
              <span>{savedAddress.line1}</span>
              <span>
                {savedAddress.city}, {savedAddress.region}{" "}
                {savedAddress.postalCode}
              </span>
              <span>United States</span>
            </address>
            <Button
              variant="ghost"
              size="sm"
              className="text-destructive hover:text-destructive mt-3 h-7 px-2 text-xs"
              onClick={() => setShowDeleteConfirm(true)}
            >
              <Trash2 className="mr-1 h-3.5 w-3.5" />
              Delete address
            </Button>
          </>
        ) : (
          <p className="text-muted-foreground mt-4 text-sm">
            No address saved yet.
          </p>
        )
      ) : (
        <ProfileAddressForm
          addrDraft={draft}
          setAddrDraft={setDraft}
          fieldErrors={fieldErrors}
          suggestions={suggestions}
          onPlaceSelect={handlePlaceSelect}
          onSave={handleSave}
          onCancel={handleCancel}
        />
      )}

      <DeleteAddressDialog
        open={showDeleteConfirm}
        onOpenChange={setShowDeleteConfirm}
        onConfirm={handleDelete}
        isDeleting={isDeleting}
      />
    </section>
  )
}
