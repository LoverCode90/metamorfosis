"use client"

import { MapPin, Pencil, Plus } from "lucide-react"

import { Button } from "@/components/ui/button"
import { AddressForm } from "@/components/checkout/address-form"
import { AddressSummary } from "@/components/checkout/address-summary"
import { useAddressBook } from "@/hooks/use-address-book"
import type { SavedAddress } from "@/lib/checkout"

interface AddressBookProps {
  address: SavedAddress | null
  onSave: (address: SavedAddress) => void
}

/**
 * Shipping-address card: shows the saved address with an edit affordance, an
 * inline edit form, or an empty-state prompt. State lives in
 * {@link useAddressBook}.
 */
export function AddressBook({ address, onSave }: AddressBookProps) {
  const a = useAddressBook(address, onSave)

  return (
    <section
      aria-labelledby="address-book-heading"
      className="border-border bg-card rounded-xl border p-5"
    >
      <div className="flex items-center justify-between">
        <h3
          id="address-book-heading"
          className="text-foreground flex items-center gap-2 text-sm font-semibold"
        >
          <MapPin
            className="text-muted-foreground h-4 w-4"
            strokeWidth={1.75}
          />
          Shipping address
        </h3>

        {!a.editing && (
          <Button
            variant="ghost"
            size="sm"
            onClick={a.startEdit}
            className="text-muted-foreground"
          >
            <Pencil className="h-3.5 w-3.5" strokeWidth={1.75} />
            Edit
          </Button>
        )}
      </div>

      {!a.editing && address && <AddressSummary address={address} />}

      {a.editing && (
        <AddressForm
          draft={a.draft}
          shipping={a.shipping}
          showCancel={address !== null}
          onField={a.setField}
          onSave={a.save}
          onCancel={a.cancelEdit}
        />
      )}

      {!a.editing && !address && (
        <Button
          variant="outline"
          onClick={a.startEdit}
          className="text-muted-foreground mt-4 h-auto w-full border-dashed py-4"
        >
          <Plus className="h-4 w-4" strokeWidth={1.75} />
          Add a shipping address
        </Button>
      )}
    </section>
  )
}
