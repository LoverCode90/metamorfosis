import { useState, useEffect } from "react"

export interface PlaceSuggestion {
  place_id: string
  description: string
  main_text: string
  secondary_text: string
}

export function usePlacesAutocomplete(inputValue: string) {
  const [suggestions, setSuggestions] = useState<PlaceSuggestion[]>([])
  // We no longer load the JS SDK, so we're always "loaded"
  const isLoaded = true

  useEffect(() => {
    if (inputValue.length < 5) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setSuggestions([])
      return
    }

    const fetchSuggestions = setTimeout(async () => {
      try {
        const res = await fetch("/api/places/autocomplete", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ input: inputValue }),
        })

        if (!res.ok) {
          setSuggestions([])
          return
        }

        const data = await res.json()
        if (data.suggestions) {
          setSuggestions(data.suggestions)
        } else {
          setSuggestions([])
        }
      } catch (error) {
        console.error("Failed to fetch autocomplete suggestions", error)
        setSuggestions([])
      }
    }, 300)

    return () => clearTimeout(fetchSuggestions)
  }, [inputValue])

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const getPlaceDetails = async (placeId: string): Promise<any> => {
    const res = await fetch("/api/places/details", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ placeId }),
    })

    if (!res.ok) {
      throw new Error("Failed to fetch place details")
    }

    const data = await res.json()
    return data
  }

  return { suggestions, isLoaded, getPlaceDetails, setSuggestions }
}
