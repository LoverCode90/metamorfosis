"use client"

import { useState } from "react"
import { MapPin, Pencil, Check, Plus } from "lucide-react"
import type { SavedAddress } from "@/lib/checkout"
import { SHIPPING_TABLE, formatUSD, shippingFor } from "@/lib/checkout"
import { cn } from "@/lib/utils"

const COUNTRIES = Object.keys(SHIPPING_TABLE)

const EMPTY: SavedAddress = {
  fullName: "",
  line1: "",
  city: "",
  region: "",
  postalCode: "",
  country: "United States",
}

interface AddressBookProps {
  address: SavedAddress | null
  onSave: (address: SavedAddress) => void
}

export function AddressBook({ address, onSave }: AddressBookProps) {
  // Start in edit mode only when there is no saved address yet.
  const [editing, setEditing] = useState(address === null)
  const [draft, setDraft] = useState<SavedAddress>(address ?? EMPTY)

  function handleSave() {
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

  const shipping = shippingFor(draft.country)

  return (
    <section
      aria-labelledby="address-book-heading"
      className="rounded-xl border border-border bg-card p-5"
    >
      <div className="flex items-center justify-between">
        <h3
          id="address-book-heading"
          className="flex items-center gap-2 text-sm font-semibold text-foreground"
        >
          <MapPin className="h-4 w-4 text-muted-foreground" strokeWidth={1.75} />
          Shipping address
        </h3>

        {!editing && (
          <button
            type="button"
            onClick={() => {
              setDraft(address ?? EMPTY)
              setEditing(true)
            }}
            className="inline-flex items-center gap-1.5 text-xs font-medium text-muted-foreground transition-colors hover:text-foreground"
          >
            <Pencil className="h-3.5 w-3.5" strokeWidth={1.75} />
            Edit
          </button>
        )}
      </div>

      {/* Saved summary */}
      {!editing && address && (
        <div className="mt-4 flex items-start gap-3 rounded-lg border border-foreground bg-foreground/[0.03] p-4">
          <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-foreground">
            <Check className="h-3 w-3 text-background" strokeWidth={3} />
          </span>
          <div className="text-sm leading-relaxed">
            <p className="font-medium text-foreground">{address.fullName}</p>
            <p className="text-muted-foreground">{address.line1}</p>
            <p className="text-muted-foreground">
              {address.city}
              {address.region ? `, ${address.region}` : ""} {address.postalCode}
            </p>
            <p className="text-muted-foreground">{address.country}</p>
            <p className="mt-2 text-xs font-medium text-foreground">
              Estimated shipping to {address.country}:{" "}
              {shippingFor(address.country) === 0
                ? "Free"
                : formatUSD(shippingFor(address.country))}
            </p>
          </div>
        </div>
      )}

      {/* Inline edit form */}
      {editing && (
        <div className="mt-4 space-y-4">
          <Field
            id="addr-name"
            label="Full name"
            value={draft.fullName}
            onChange={(v) => setDraft((d) => ({ ...d, fullName: v }))}
            autoComplete="name"
          />
          <Field
            id="addr-line1"
            label="Street address"
            value={draft.line1}
            onChange={(v) => setDraft((d) => ({ ...d, line1: v }))}
            autoComplete="address-line1"
          />
          <div className="grid grid-cols-2 gap-4">
            <Field
              id="addr-city"
              label="City"
              value={draft.city}
              onChange={(v) => setDraft((d) => ({ ...d, city: v }))}
              autoComplete="address-level2"
            />
            <Field
              id="addr-region"
              label="State / Region"
              value={draft.region}
              onChange={(v) => setDraft((d) => ({ ...d, region: v }))}
              autoComplete="address-level1"
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <Field
              id="addr-zip"
              label="Postal code"
              value={draft.postalCode}
              onChange={(v) => setDraft((d) => ({ ...d, postalCode: v }))}
              autoComplete="postal-code"
            />
            <div>
              <label
                htmlFor="addr-country"
                className="mb-1.5 block text-xs font-medium text-muted-foreground"
              >
                Country
              </label>
              <select
                id="addr-country"
                value={draft.country}
                onChange={(e) => setDraft((d) => ({ ...d, country: e.target.value }))}
                className="h-11 w-full rounded-md border border-border bg-background px-3 text-sm text-foreground outline-none transition-colors focus:border-foreground"
              >
                {COUNTRIES.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Live shipping recalculation */}
          <div className="flex items-center justify-between rounded-lg bg-muted px-4 py-3 text-sm">
            <span className="text-muted-foreground">Shipping to {draft.country}</span>
            <span className="font-semibold text-foreground tabular-nums">
              {shipping === 0 ? "Free" : formatUSD(shipping)}
            </span>
          </div>

          <div className="flex gap-3">
            <button
              type="button"
              onClick={handleSave}
              className="inline-flex h-11 flex-1 items-center justify-center gap-2 rounded-md bg-foreground text-sm font-semibold text-background transition-opacity hover:opacity-90"
            >
              <Check className="h-4 w-4" strokeWidth={2} />
              Save address
            </button>
            {address && (
              <button
                type="button"
                onClick={() => {
                  setDraft(address)
                  setEditing(false)
                }}
                className="h-11 rounded-md border border-border px-5 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
              >
                Cancel
              </button>
            )}
          </div>
        </div>
      )}

      {/* Empty state add button */}
      {!editing && !address && (
        <button
          type="button"
          onClick={() => setEditing(true)}
          className="mt-4 inline-flex w-full items-center justify-center gap-2 rounded-lg border border-dashed border-border py-4 text-sm font-medium text-muted-foreground transition-colors hover:border-foreground/40 hover:text-foreground"
        >
          <Plus className="h-4 w-4" strokeWidth={1.75} />
          Add a shipping address
        </button>
      )}
    </section>
  )
}

function Field({
  id,
  label,
  value,
  onChange,
  autoComplete,
}: {
  id: string
  label: string
  value: string
  onChange: (v: string) => void
  autoComplete?: string
}) {
  return (
    <div>
      <label
        htmlFor={id}
        className="mb-1.5 block text-xs font-medium text-muted-foreground"
      >
        {label}
      </label>
      <input
        id={id}
        type="text"
        value={value}
        autoComplete={autoComplete}
        onChange={(e) => onChange(e.target.value)}
        className={cn(
          "h-11 w-full rounded-md border border-border bg-background px-3 text-sm text-foreground",
          "outline-none transition-colors focus:border-foreground",
        )}
      />
    </div>
  )
}
