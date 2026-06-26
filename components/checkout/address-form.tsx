"use client"

import { Check } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { NativeSelect } from "@/components/ui/native-select"
import { AddressField } from "@/components/checkout/address-field"
import { SHIPPING_TABLE, formatUSD } from "@/lib/checkout"
import type { SavedAddress } from "@/lib/checkout"

const COUNTRIES = Object.keys(SHIPPING_TABLE)

interface AddressFormProps {
  draft: SavedAddress
  shipping: number
  showCancel: boolean
  onField: (key: keyof SavedAddress, value: string) => void
  onSave: () => void
  onCancel: () => void
}

/** Inline shipping-address edit form with live shipping recalculation. */
export function AddressForm({
  draft,
  shipping,
  showCancel,
  onField,
  onSave,
  onCancel,
}: AddressFormProps) {
  return (
    <div className="mt-4 space-y-4">
      <AddressField
        id="addr-name"
        label="Full name"
        value={draft.fullName}
        onChange={(v) => onField("fullName", v)}
        autoComplete="name"
      />
      <AddressField
        id="addr-line1"
        label="Street address"
        value={draft.line1}
        onChange={(v) => onField("line1", v)}
        autoComplete="address-line1"
      />
      <div className="grid grid-cols-2 gap-4">
        <AddressField
          id="addr-city"
          label="City"
          value={draft.city}
          onChange={(v) => onField("city", v)}
          autoComplete="address-level2"
        />
        <AddressField
          id="addr-region"
          label="State / Region"
          value={draft.region}
          onChange={(v) => onField("region", v)}
          autoComplete="address-level1"
        />
      </div>
      <div className="grid grid-cols-2 gap-4">
        <AddressField
          id="addr-zip"
          label="Postal code"
          value={draft.postalCode}
          onChange={(v) => onField("postalCode", v)}
          autoComplete="postal-code"
        />
        <div>
          <Label
            htmlFor="addr-country"
            className="text-muted-foreground mb-1.5 text-xs"
          >
            Country
          </Label>
          <NativeSelect
            id="addr-country"
            value={draft.country}
            onChange={(e) => onField("country", e.target.value)}
            className="h-11"
          >
            {COUNTRIES.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </NativeSelect>
        </div>
      </div>

      <div className="bg-muted flex items-center justify-between rounded-lg px-4 py-3 text-sm">
        <span className="text-muted-foreground">
          Shipping to {draft.country}
        </span>
        <span className="text-foreground font-semibold tabular-nums">
          {shipping === 0 ? "Free" : formatUSD(shipping)}
        </span>
      </div>

      <div className="flex gap-3">
        <Button onClick={onSave} className="h-11 flex-1">
          <Check className="h-4 w-4" strokeWidth={2} />
          Save address
        </Button>
        {showCancel && (
          <Button
            variant="outline"
            onClick={onCancel}
            className="text-muted-foreground h-11"
          >
            Cancel
          </Button>
        )}
      </div>
    </div>
  )
}
