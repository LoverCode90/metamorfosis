import type { SavedAddress } from "@/lib/types"

export type AddressDraft = SavedAddress & { phone: string }
export type FieldErrors = Partial<Record<keyof AddressDraft, string>>

export const EMPTY_ADDRESS_DRAFT: AddressDraft = {
  fullName: "",
  phone: "",
  line1: "",
  city: "",
  region: "",
  postalCode: "",
  country: "US",
}

export const REQUIRED_ADDRESS_FIELDS: (keyof AddressDraft)[] = [
  "fullName",
  "phone",
  "line1",
  "city",
  "region",
  "postalCode",
]

export const ADDRESS_FIELD_LABELS: Partial<Record<keyof AddressDraft, string>> =
  {
    fullName: "Full name",
    phone: "Phone",
    line1: "Address line 1",
    city: "City",
    region: "State",
    postalCode: "ZIP code",
  }

export function parsePlaceResult(components: any[]) {
  let num = "",
    route = "",
    city = "",
    state = "",
    zip = ""
  for (const component of components ?? []) {
    if (component.types.includes("street_number")) num = component.long_name
    if (component.types.includes("route")) route = component.short_name
    if (component.types.includes("locality")) city = component.long_name
    if (component.types.includes("administrative_area_level_1"))
      state = component.short_name
    if (component.types.includes("postal_code")) zip = component.long_name
  }
  return {
    line1: `${num} ${route}`.trim(),
    city,
    region: state,
    postalCode: zip,
  }
}
