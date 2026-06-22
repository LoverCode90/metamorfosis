import { useState, useEffect, useRef } from "react"

export interface PlaceSuggestion {
  place_id: string
  description: string
  main_text: string
  secondary_text: string
}

export function usePlacesAutocomplete(inputValue: string) {
  const [suggestions, setSuggestions] = useState<PlaceSuggestion[]>([])
  const [isLoaded, setIsLoaded] = useState(false)
  const autocompleteService =
    useRef<google.maps.places.AutocompleteService | null>(null)
  const placesService = useRef<google.maps.places.PlacesService | null>(null)

  useEffect(() => {
    if (typeof window === "undefined") return

    if (window.google?.maps?.places) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setIsLoaded(true)
      return
    }

    const scriptId = "google-maps-places"
    let script = document.getElementById(scriptId) as HTMLScriptElement

    if (!script) {
      script = document.createElement("script")
      script.id = scriptId
      script.src = `https://maps.googleapis.com/maps/api/js?key=${process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY}&libraries=places`
      script.async = true
      script.defer = true
      document.head.appendChild(script)
    }

    const onScriptLoad = () => setIsLoaded(true)
    const onScriptError = () =>
      console.error("Failed to load Google Maps script")

    script.addEventListener("load", onScriptLoad)
    script.addEventListener("error", onScriptError)

    return () => {
      script.removeEventListener("load", onScriptLoad)
      script.removeEventListener("error", onScriptError)
    }
  }, [])

  useEffect(() => {
    if (!isLoaded || !window.google) return
    if (!autocompleteService.current) {
      autocompleteService.current =
        new window.google.maps.places.AutocompleteService()
    }
    // We create a dummy div for PlacesService since it requires a map or element
    if (!placesService.current) {
      placesService.current = new window.google.maps.places.PlacesService(
        document.createElement("div"),
      )
    }
  }, [isLoaded])

  useEffect(() => {
    if (!autocompleteService.current || inputValue.length < 5) {
      setSuggestions([])
      return
    }

    const fetchSuggestions = setTimeout(() => {
      autocompleteService.current?.getPlacePredictions(
        { input: inputValue, componentRestrictions: { country: "us" } },
        (predictions, status) => {
          if (
            status !== window.google.maps.places.PlacesServiceStatus.OK ||
            !predictions
          ) {
            setSuggestions([])
            return
          }
          setSuggestions(
            predictions.map((p) => ({
              place_id: p.place_id,
              description: p.description,
              main_text: p.structured_formatting.main_text,
              secondary_text: p.structured_formatting.secondary_text,
            })),
          )
        },
      )
    }, 300)

    return () => clearTimeout(fetchSuggestions)
  }, [inputValue, isLoaded])

  const getPlaceDetails = (
    placeId: string,
  ): Promise<google.maps.places.PlaceResult> => {
    return new Promise((resolve, reject) => {
      if (!placesService.current)
        return reject(new Error("Places service not ready"))
      placesService.current.getDetails(
        {
          placeId,
          fields: ["address_components", "geometry"],
        },
        (place, status) => {
          if (
            status === window.google.maps.places.PlacesServiceStatus.OK &&
            place
          ) {
            resolve(place)
          } else {
            reject(new Error("Failed to fetch place details"))
          }
        },
      )
    })
  }

  return { suggestions, isLoaded, getPlaceDetails, setSuggestions }
}
