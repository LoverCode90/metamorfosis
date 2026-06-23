import type React from "react"
import { MapPin } from "lucide-react"
import type { PlaceSuggestion } from "@/hooks/use-places-autocomplete"
import type { SavedAddress } from "@/lib/types"
import { CONTINENTAL_STATES } from "@/lib/constants"
import { PhoneInput } from "@/components/ui/phone-input"

type AddressDraft = SavedAddress & { phone: string }

interface ProfileAddressFormProps {
  addrDraft: AddressDraft
  setAddrDraft: React.Dispatch<React.SetStateAction<AddressDraft>>
  suggestions: PlaceSuggestion[]
  onPlaceSelect: (placeId: string) => void
  onSave: () => void
  onCancel: () => void
}

const inputClass =
  "border-border bg-background text-foreground focus:border-foreground h-9 w-full rounded-md border px-3 text-sm transition-colors outline-none"

export function ProfileAddressForm({
  addrDraft,
  setAddrDraft,
  suggestions,
  onPlaceSelect,
  onSave,
  onCancel,
}: ProfileAddressFormProps) {
  return (
    <div className="mt-4 flex flex-col gap-3">
      {/* Full name */}
      <div>
        <label className="text-muted-foreground mb-1 block text-xs">
          Full name
        </label>
        <input
          type="text"
          autoComplete="name"
          value={addrDraft.fullName}
          onChange={(e) =>
            setAddrDraft((d) => ({ ...d, fullName: e.target.value }))
          }
          className={inputClass}
        />
      </div>

      {/* Phone */}
      <div>
        <label className="text-muted-foreground mb-1 block text-xs">
          Phone
        </label>
        <PhoneInput
          value={addrDraft.phone}
          onChange={(v) => setAddrDraft((d) => ({ ...d, phone: v }))}
          className="h-9"
        />
      </div>

      {/* Street */}
      <div className="relative">
        <label className="text-muted-foreground mb-1 block text-xs">
          Address line 1
        </label>
        <input
          type="text"
          autoComplete="off"
          value={addrDraft.line1}
          onChange={(e) =>
            setAddrDraft((d) => ({ ...d, line1: e.target.value }))
          }
          className={inputClass}
        />
        {suggestions.length > 0 && (
          <ul className="border-border bg-background absolute z-10 mt-1 max-h-60 w-full overflow-hidden overflow-y-auto rounded-md border shadow-lg">
            {suggestions.map((s) => (
              <li
                key={s.place_id}
                onClick={() => onPlaceSelect(s.place_id)}
                className="hover:bg-muted/50 flex cursor-pointer items-start gap-3 px-3 py-2.5 transition-colors"
              >
                <MapPin className="text-muted-foreground mt-0.5 h-4 w-4 shrink-0" />
                <div className="flex flex-col">
                  <span className="text-foreground text-sm font-medium">
                    {s.main_text}
                  </span>
                  <span className="text-muted-foreground text-xs">
                    {s.secondary_text}
                  </span>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>

      {/* City */}
      <div>
        <label className="text-muted-foreground mb-1 block text-xs">City</label>
        <input
          type="text"
          autoComplete="address-level2"
          value={addrDraft.city}
          onChange={(e) =>
            setAddrDraft((d) => ({ ...d, city: e.target.value }))
          }
          className={inputClass}
        />
      </div>

      {/* State dropdown — 48 continental states + DC, no HI/AK */}
      <div>
        <label className="text-muted-foreground mb-1 block text-xs">
          State
        </label>
        <select
          value={addrDraft.region}
          onChange={(e) =>
            setAddrDraft((d) => ({ ...d, region: e.target.value }))
          }
          className={inputClass}
        >
          <option value="">Select state</option>
          {CONTINENTAL_STATES.map((s) => (
            <option key={s.code} value={s.code}>
              {s.name}
            </option>
          ))}
        </select>
      </div>

      {/* Postal code */}
      <div>
        <label className="text-muted-foreground mb-1 block text-xs">
          Postal code
        </label>
        <input
          type="text"
          inputMode="numeric"
          autoComplete="postal-code"
          value={addrDraft.postalCode}
          onChange={(e) =>
            setAddrDraft((d) => ({ ...d, postalCode: e.target.value }))
          }
          className={inputClass}
        />
      </div>

      {/* Country — locked to continental US */}
      <div>
        <label className="text-muted-foreground mb-1 block text-xs">
          Country
        </label>
        <div className="border-border bg-muted/40 text-muted-foreground flex h-9 w-full items-center justify-between rounded-md border px-3 text-sm">
          <span className="text-foreground">United States</span>
          <span className="text-xs">Continental US only</span>
        </div>
      </div>

      <div className="flex gap-2 pt-1">
        <button
          type="button"
          onClick={onSave}
          className="bg-accent-violet h-9 rounded-md px-4 text-sm font-semibold text-white transition-opacity hover:opacity-90"
        >
          Save address
        </button>
        <button
          type="button"
          onClick={onCancel}
          className="border-border text-foreground hover:bg-muted h-9 rounded-md border px-4 text-sm font-medium transition-colors"
        >
          Cancel
        </button>
      </div>
    </div>
  )
}
