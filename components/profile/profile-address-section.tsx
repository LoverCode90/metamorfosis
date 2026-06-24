"use client"

import { useState } from "react"
import type { User } from "@supabase/supabase-js"
import { Pencil } from "lucide-react"
import { usePlacesAutocomplete } from "@/hooks/use-places-autocomplete"
import type { SavedAddress } from "@/lib/types"
import { formatPhone, digits as phoneDigits } from "@/lib/utils/phone"
import { ProfileAddressForm } from "./profile-address-form"

type AddressDraft = SavedAddress & { phone: string }

const EMPTY_DRAFT: AddressDraft = {
  fullName: "",
  phone: "",
  line1: "",
  city: "",
  region: "",
  postalCode: "",
  country: "US",
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
  const [editingAddress, setEditingAddress] = useState(false)
  const [addrDraft, setAddrDraft] = useState<AddressDraft>(EMPTY_DRAFT)

  const { suggestions, getPlaceDetails, setSuggestions } =
    usePlacesAutocomplete(addrDraft.line1)

  async function handlePlaceSelect(placeId: string) {
    try {
      const details = await getPlaceDetails(placeId)
      let street_number = ""
      let route = ""
      let city = ""
      let state = ""
      let zip = ""

      for (const component of details.address_components || []) {
        const types = component.types
        if (types.includes("street_number")) street_number = component.long_name
        if (types.includes("route")) route = component.short_name
        if (types.includes("locality")) city = component.long_name
        if (types.includes("administrative_area_level_1"))
          state = component.short_name
        if (types.includes("postal_code")) zip = component.long_name
      }

      setAddrDraft((d) => ({
        ...d,
        line1: `${street_number} ${route}`.trim(),
        city,
        region: state,
        postalCode: zip,
      }))
      setSuggestions([])
    } catch (e) {
      console.error(e)
    }
  }

  function startEditing() {
    setAddrDraft({
      fullName: savedAddress?.fullName ?? "",
      phone: phoneDigits(savedAddress?.phone ?? ""),
      line1: savedAddress?.line1 ?? "",
      city: savedAddress?.city ?? "",
      region: savedAddress?.region ?? "",
      postalCode: savedAddress?.postalCode ?? "",
      country: "US",
    })
    setEditingAddress(true)
  }

  function handleSaveAddress() {
    const formatted = {
      ...addrDraft,
      phone: addrDraft.phone ? formatPhone(addrDraft.phone) : "",
      country: "US",
    }
    saveAddress(formatted)
    setEditingAddress(false)

    if (user) {
      fetch("/api/addresses/default", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          fullName: formatted.fullName,
          email,
          phone: formatted.phone,
          streetLine1: formatted.line1,
          streetLine2: "",
          city: formatted.city,
          state: formatted.region,
          zip: formatted.postalCode,
          country: "US",
        }),
      }).catch(() => {})
    }
  }

  return (
    <section className="border-border bg-card rounded-2xl border p-6">
      <div className="flex items-center justify-between">
        <h3 className="text-foreground text-sm font-semibold">Saved Address</h3>
        {!editingAddress && (
          <button
            type="button"
            onClick={startEditing}
            className="text-muted-foreground hover:text-foreground flex items-center gap-1 text-xs font-medium"
          >
            <Pencil className="h-3.5 w-3.5" strokeWidth={1.75} />
            {savedAddress ? "Edit" : "Add address"}
          </button>
        )}
      </div>

      {!editingAddress ? (
        savedAddress ? (
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
        ) : (
          <p className="text-muted-foreground mt-4 text-sm">
            No address saved yet.
          </p>
        )
      ) : (
        <ProfileAddressForm
          addrDraft={addrDraft}
          setAddrDraft={setAddrDraft}
          suggestions={suggestions}
          onPlaceSelect={handlePlaceSelect}
          onSave={handleSaveAddress}
          onCancel={() => setEditingAddress(false)}
        />
      )}
    </section>
  )
}
