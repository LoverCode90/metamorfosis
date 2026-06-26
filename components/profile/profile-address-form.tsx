"use client"

import type React from "react"
import { MapPin } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { NativeSelect } from "@/components/ui/native-select"
import { PhoneInput } from "@/components/ui/phone-input"
import { AddressFieldGroup } from "@/components/profile/address-field-group"
import { CONTINENTAL_STATES } from "@/lib/constants"
import type { PlaceSuggestion } from "@/hooks/use-places-autocomplete"
import type { SavedAddress } from "@/lib/types"

type AddressDraft = SavedAddress & { phone: string }

interface ProfileAddressFormProps {
  addrDraft: AddressDraft
  setAddrDraft: React.Dispatch<React.SetStateAction<AddressDraft>>
  suggestions: PlaceSuggestion[]
  onPlaceSelect: (placeId: string) => void
  onSave: () => void
  onCancel: () => void
}

export function ProfileAddressForm({
  addrDraft,
  setAddrDraft,
  suggestions,
  onPlaceSelect,
  onSave,
  onCancel,
}: ProfileAddressFormProps) {
  const setField = (key: keyof AddressDraft, value: string) =>
    setAddrDraft((draft) => ({ ...draft, [key]: value }))

  return (
    <div className="mt-4 flex flex-col gap-3">
      <AddressFieldGroup label="Full name">
        <Input
          autoComplete="name"
          value={addrDraft.fullName}
          onChange={(e) => setField("fullName", e.target.value)}
          className="h-9"
        />
      </AddressFieldGroup>

      <AddressFieldGroup label="Phone">
        <PhoneInput
          value={addrDraft.phone}
          onChange={(value) => setField("phone", value)}
          className="h-9"
        />
      </AddressFieldGroup>

      <AddressFieldGroup label="Address line 1" className="relative">
        <Input
          autoComplete="off"
          value={addrDraft.line1}
          onChange={(e) => setField("line1", e.target.value)}
          className="h-9"
        />
        {suggestions.length > 0 && (
          <ul className="border-border bg-background absolute z-10 mt-1 max-h-60 w-full overflow-y-auto rounded-md border shadow-lg">
            {suggestions.map((suggestion) => (
              <li
                key={suggestion.place_id}
                onClick={() => onPlaceSelect(suggestion.place_id)}
                className="hover:bg-muted/50 flex cursor-pointer items-start gap-3 px-3 py-2.5 transition-colors"
              >
                <MapPin className="text-muted-foreground mt-0.5 h-4 w-4 shrink-0" />
                <div className="flex flex-col">
                  <span className="text-foreground text-sm font-medium">
                    {suggestion.main_text}
                  </span>
                  <span className="text-muted-foreground text-xs">
                    {suggestion.secondary_text}
                  </span>
                </div>
              </li>
            ))}
          </ul>
        )}
      </AddressFieldGroup>

      <AddressFieldGroup label="City">
        <Input
          autoComplete="address-level2"
          value={addrDraft.city}
          onChange={(e) => setField("city", e.target.value)}
          className="h-9"
        />
      </AddressFieldGroup>

      <AddressFieldGroup label="State">
        <NativeSelect
          value={addrDraft.region}
          onChange={(e) => setField("region", e.target.value)}
          className="h-9"
        >
          <option value="">Select state</option>
          {CONTINENTAL_STATES.map((state) => (
            <option key={state.code} value={state.code}>
              {state.name}
            </option>
          ))}
        </NativeSelect>
      </AddressFieldGroup>

      <AddressFieldGroup label="Postal code">
        <Input
          inputMode="numeric"
          autoComplete="postal-code"
          value={addrDraft.postalCode}
          onChange={(e) => setField("postalCode", e.target.value)}
          className="h-9"
        />
      </AddressFieldGroup>

      <AddressFieldGroup label="Country">
        <div className="border-border bg-muted/40 text-muted-foreground flex h-9 w-full items-center justify-between rounded-md border px-3 text-sm">
          <span className="text-foreground">United States</span>
          <span className="text-xs">Continental US only</span>
        </div>
      </AddressFieldGroup>

      <div className="flex gap-2 pt-1">
        <Button
          onClick={onSave}
          className="bg-accent-violet hover:bg-accent-violet/90 h-9 text-white"
        >
          Save address
        </Button>
        <Button variant="outline" onClick={onCancel} className="h-9">
          Cancel
        </Button>
      </div>
    </div>
  )
}
