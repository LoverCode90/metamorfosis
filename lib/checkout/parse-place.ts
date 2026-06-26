/** A single Google Places address component. */
interface PlaceComponent {
  long_name: string
  short_name: string
  types: string[]
}

/** Minimal shape of a Google Places "details" response we read. */
interface PlaceDetails {
  address_components?: PlaceComponent[]
}

/** Address fields extracted from a Places details response. */
export interface ParsedAddress {
  streetLine1: string
  city: string
  state: string
  zip: string
}

/**
 * Extracts street, city, state, and ZIP from a Google Places details payload.
 * @param details - The `/api/places/details` response.
 * @returns Normalized {@link ParsedAddress}; missing parts are empty strings.
 */
export function parsePlaceDetails(details: PlaceDetails): ParsedAddress {
  let streetNumber = ""
  let route = ""
  let city = ""
  let state = ""
  let zip = ""

  for (const component of details.address_components ?? []) {
    const { types } = component
    if (types.includes("street_number")) streetNumber = component.long_name
    if (types.includes("route")) route = component.short_name
    if (types.includes("locality")) city = component.long_name
    if (types.includes("administrative_area_level_1"))
      state = component.short_name
    if (types.includes("postal_code")) zip = component.long_name
  }

  return {
    streetLine1: `${streetNumber} ${route}`.trim(),
    city,
    state,
    zip,
  }
}
