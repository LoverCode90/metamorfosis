/** Raw `orders.shipping_address` jsonb — camelCase (checkout) or Square snake_case. */
export type RawShippingAddress = {
  fullName?: string
  email?: string
  phone?: string
  streetLine1?: string
  streetLine2?: string
  city?: string
  state?: string
  zip?: string
  country?: string
  first_name?: string
  last_name?: string
  address_line_1?: string
  address_line_2?: string
  locality?: string
  administrative_district_level_1?: string
  postal_code?: string
}

export interface NormalizedShippingAddress {
  fullName: string | null
  email: string | null
  phone: string | null
  streetLine1: string | null
  streetLine2: string | null
  city: string | null
  state: string | null
  zip: string | null
  country: string | null
}

function orNull(value: string | undefined): string | null {
  const trimmed = value?.trim()
  return trimmed ? trimmed : null
}

/** Merges checkout camelCase and legacy Square-style address fields. */
export function normalizeShippingAddress(
  address: RawShippingAddress | null | undefined,
): NormalizedShippingAddress | null {
  if (!address) return null

  const legacyName = [address.first_name, address.last_name]
    .filter(Boolean)
    .join(" ")
    .trim()

  return {
    fullName: orNull(address.fullName) ?? orNull(legacyName),
    email: orNull(address.email),
    phone: orNull(address.phone),
    streetLine1: orNull(address.streetLine1) ?? orNull(address.address_line_1),
    streetLine2: orNull(address.streetLine2) ?? orNull(address.address_line_2),
    city: orNull(address.city) ?? orNull(address.locality),
    state:
      orNull(address.state) ?? orNull(address.administrative_district_level_1),
    zip: orNull(address.zip) ?? orNull(address.postal_code),
    country: orNull(address.country) ?? "US",
  }
}
