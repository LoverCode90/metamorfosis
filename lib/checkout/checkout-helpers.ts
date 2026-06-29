import type { CartItem, CheckoutStepId } from "@/lib/types"
import type {
  CheckoutAddress,
  LiveShippingRate,
  PlaceOrderResponse,
  PriceSheet,
} from "@/lib/checkout/types"
import type { SavedCardMeta } from "@/components/checkout/steps/step-payment"
import type { InfoFormValues } from "@/lib/validation/checkout"
import type { useUser } from "@/hooks/use-user"

export interface UseCheckoutFlowResult {
  items: CartItem[]
  wizardStep: CheckoutStepId
  setWizardStep: (step: CheckoutStepId) => void
  goToCart: () => void
  // Gate
  showGate: boolean
  gatedItems: CartItem[]
  isAuthenticated: boolean
  removeProItems: () => void
  // Steps
  infoDefaults: Partial<InfoFormValues> | undefined
  address: CheckoutAddress | null
  preloadedCheckoutAddress: CheckoutAddress | null
  lineItems: { variationId: string; quantity: number }[]
  priceSheet: PriceSheet
  cachedShippingRates: LiveShippingRate[] | null
  setCachedShippingRates: (rates: LiveShippingRate[]) => void
  selectedRate: LiveShippingRate | null
  selectRate: (rate: LiveShippingRate) => void
  isUserLoading: boolean
  savedCard: SavedCardMeta | null
  continueFromInfo: (address: CheckoutAddress, terms: boolean) => void
  continueFromShipping: () => void
  submitPayment: (
    sourceId: string,
    turnstileToken: string,
    surchargeConsented: boolean,
    saveCardConsented: boolean,
  ) => Promise<PlaceOrderResponse>
}

export const CHECKOUT_STEP_KEY = "checkout_wizard_step"
export const ADDRESS_KEY = "checkout_address"
export const VALID_STEPS = new Set<string>(["info", "shipping", "payment"])

export function readSessionStep(): CheckoutStepId {
  if (typeof window === "undefined") return "info"
  const saved = sessionStorage.getItem(CHECKOUT_STEP_KEY)
  return saved && VALID_STEPS.has(saved) ? (saved as CheckoutStepId) : "info"
}

export function readSessionAddress(): CheckoutAddress | null {
  if (typeof window === "undefined") return null
  try {
    const raw = sessionStorage.getItem(ADDRESS_KEY)
    return raw ? (JSON.parse(raw) as CheckoutAddress) : null
  } catch {
    return null
  }
}

/** Maps the user's saved address book entry to a checkout address (or null). */
export function buildPreloadedAddress(
  savedAddress: ReturnType<typeof useUser>["savedAddress"],
  email: string,
): CheckoutAddress | null {
  if (!savedAddress) return null
  return {
    fullName: savedAddress.fullName ?? "",
    email,
    phone: savedAddress.phone ?? "",
    streetLine1: savedAddress.line1 ?? "",
    streetLine2: "",
    city: savedAddress.city ?? "",
    state: savedAddress.region ?? "",
    zip: savedAddress.postalCode ?? "",
    country: "US",
  }
}

type InfoDefaultsArgs = {
  address: CheckoutAddress | null
  termsAccepted: boolean
  isAuthenticated: boolean
  savedAddress: ReturnType<typeof useUser>["savedAddress"]
  dbProfile: ReturnType<typeof useUser>["dbProfile"]
}

export function resolveInfoDefaults({
  address,
  termsAccepted,
  isAuthenticated,
  savedAddress,
  dbProfile,
}: InfoDefaultsArgs): Partial<InfoFormValues> | undefined {
  if (address) {
    return {
      fullName: address.fullName,
      email: address.email,
      phone: address.phone,
      streetLine1: address.streetLine1,
      streetLine2: address.streetLine2,
      city: address.city,
      state: address.state,
      zip: address.zip,
      termsAccepted,
    }
  }

  if (isAuthenticated && savedAddress) {
    return {
      fullName: savedAddress.fullName,
      email: dbProfile?.email || "",
      phone: savedAddress.phone || dbProfile?.phone_number || "",
      streetLine1: savedAddress.line1 || "",
      streetLine2: "",
      city: savedAddress.city || "",
      state: savedAddress.region || "",
      zip: savedAddress.postalCode || "",
    }
  }

  if (isAuthenticated && dbProfile) {
    return {
      fullName: dbProfile.full_name,
      email: dbProfile.email,
      phone: dbProfile.phone_number ?? "",
    }
  }

  return undefined
}
