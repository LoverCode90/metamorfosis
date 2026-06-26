import { digits, formatPhone } from "@/lib/utils/phone"

import type { InfoFormValues } from "@/lib/validation/checkout"
import type { CheckoutAddress } from "@/lib/checkout/types"

/**
 * Builds the initial react-hook-form values for step-info, normalizing any
 * pre-filled phone (formatted from a profile/saved address) to the raw
 * 10-digit form the {@link PhoneInput} expects.
 * @param defaults - Pre-fill values from profile or a prior submission.
 */
export function buildInfoDefaults(
  defaults?: Partial<InfoFormValues>,
): Partial<InfoFormValues> {
  return {
    state: "",
    ...defaults,
    phone: defaults?.phone ? digits(defaults.phone) : "",
  }
}

/**
 * Maps a saved {@link CheckoutAddress} to step-info form values (phone reduced
 * to raw digits for the {@link PhoneInput}).
 */
export function addressToInfoValues(address: CheckoutAddress): InfoFormValues {
  return {
    fullName: address.fullName,
    email: address.email,
    phone: digits(address.phone),
    streetLine1: address.streetLine1,
    streetLine2: address.streetLine2,
    city: address.city,
    state: address.state,
    zip: address.zip,
  }
}

/**
 * Maps validated step-info form values to a {@link CheckoutAddress}, formatting
 * the phone to US national form (accepted by Shippo) and locking country to US.
 */
export function infoValuesToAddress(values: InfoFormValues): CheckoutAddress {
  return {
    fullName: values.fullName,
    email: values.email,
    phone: formatPhone(values.phone),
    streetLine1: values.streetLine1,
    streetLine2: values.streetLine2 ?? "",
    city: values.city,
    state: values.state,
    zip: values.zip,
    country: "US",
  }
}
