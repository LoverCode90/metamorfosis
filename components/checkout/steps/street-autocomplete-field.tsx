"use client"

import { useState } from "react"
import type { UseFormRegister } from "react-hook-form"
import { MapPin } from "lucide-react"

import { FloatingInput } from "@/components/checkout/floating-input"
import {
  usePlacesAutocomplete,
  type PlaceSuggestion,
} from "@/hooks/use-places-autocomplete"
import {
  parsePlaceDetails,
  type ParsedAddress,
} from "@/lib/checkout/parse-place"
import type { InfoFormValues } from "@/lib/validation/checkout"

interface StreetAutocompleteFieldProps {
  /** Current street value, used as the autocomplete query. */
  value: string
  error?: string
  register: UseFormRegister<InfoFormValues>
  /** Called with the parsed address when a suggestion is selected. */
  onPlaceParsed: (parsed: ParsedAddress) => void
}

/**
 * Street-address field with Google Places autocomplete. Renders suggestions
 * while focused and emits a {@link ParsedAddress} via `onPlaceParsed` on select.
 */
export function StreetAutocompleteField({
  value,
  error,
  register,
  onPlaceParsed,
}: StreetAutocompleteFieldProps) {
  const [isFocused, setIsFocused] = useState(false)
  const { suggestions, getPlaceDetails, setSuggestions } =
    usePlacesAutocomplete(value, isFocused)
  const streetField = register("streetLine1")

  async function handleSelect(placeId: string) {
    try {
      const details = await getPlaceDetails(placeId)
      onPlaceParsed(parsePlaceDetails(details))
      setSuggestions([])
    } catch (e) {
      console.error(e)
    }
  }

  return (
    <div className="relative">
      <FloatingInput
        label="Street address"
        required
        error={error}
        autoComplete="off"
        {...streetField}
        onFocus={() => setIsFocused(true)}
        onBlur={(e) => {
          streetField.onBlur(e)
          setTimeout(() => setIsFocused(false), 200)
        }}
      />
      {suggestions.length > 0 && (
        <ul className="border-border bg-background absolute z-50 mt-1 max-h-60 w-full overflow-y-auto rounded-md border shadow-2xl">
          {suggestions.map((s: PlaceSuggestion) => (
            <li
              key={s.place_id}
              onClick={() => handleSelect(s.place_id)}
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
  )
}
