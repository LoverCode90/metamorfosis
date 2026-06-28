"use client"

import { useCallback, useEffect, useState } from "react"
import { useRouter } from "next/navigation"

import { useCart } from "@/hooks/use-cart"
import { useUser } from "@/hooks/use-user"
import { createClient } from "@/lib/supabase/client"
import {
  fetchSavedCard,
  fetchTaxRate,
  placeOrder,
  saveDefaultAddress,
} from "@/lib/checkout/checkout-api"
import { toLineItems, toPriceSheetItems } from "@/lib/checkout/checkout-flow"
import { buildPriceSheet } from "@/lib/checkout/totals"
import { TAX_RATE } from "@/lib/utils/totals"
import type { CartItem, CheckoutStepId } from "@/lib/types"
import type {
  CheckoutAddress,
  PlaceOrderResponse,
  PriceSheet,
  ShippingMethod,
  ShippingRate,
} from "@/lib/checkout/types"
import type { SavedCardMeta } from "@/components/checkout/steps/step-payment"
import type { InfoFormValues } from "@/lib/validation/checkout"

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
  hasNonReturnable: boolean
  infoDefaults: Partial<InfoFormValues> | undefined
  address: CheckoutAddress | null
  preloadedCheckoutAddress: CheckoutAddress | null
  lineItems: { variationId: string; quantity: number }[]
  priceSheet: PriceSheet
  cachedShippingRates: ShippingRate[] | null
  setCachedShippingRates: (rates: ShippingRate[]) => void
  isUserLoading: boolean
  savedCard: SavedCardMeta | null
  continueFromInfo: (address: CheckoutAddress, terms: boolean) => void
  continueFromShipping: (method: ShippingMethod) => void
  submitPayment: (
    sourceId: string,
    turnstileToken: string,
    surchargeConsented: boolean,
    saveCardConsented: boolean,
  ) => Promise<PlaceOrderResponse>
}

const CHECKOUT_STEP_KEY = "checkout_wizard_step"
const ADDRESS_KEY = "checkout_address"
const VALID_STEPS = new Set<string>(["info", "shipping", "payment"])

function readSessionStep(): CheckoutStepId {
  if (typeof window === "undefined") return "info"
  const saved = sessionStorage.getItem(CHECKOUT_STEP_KEY)
  return saved && VALID_STEPS.has(saved) ? (saved as CheckoutStepId) : "info"
}

function readSessionAddress(): CheckoutAddress | null {
  if (typeof window === "undefined") return null
  try {
    const raw = sessionStorage.getItem(ADDRESS_KEY)
    return raw ? (JSON.parse(raw) as CheckoutAddress) : null
  } catch {
    return null
  }
}

export function useCheckoutFlow(): UseCheckoutFlowResult {
  const router = useRouter()
  const { items, clearCart, removeItem } = useCart()
  const {
    user,
    dbProfile,
    savedAddress,
    saveAddress,
    isLoading: isUserLoading,
  } = useUser()

  const [wizardStep, setWizardStepRaw] =
    useState<CheckoutStepId>(readSessionStep)

  const setWizardStep = useCallback((step: CheckoutStepId) => {
    sessionStorage.setItem(CHECKOUT_STEP_KEY, step)
    setWizardStepRaw(step)
    window.history.pushState({ checkoutStep: step }, "", "/checkout")
  }, [])

  // Replace the initial history entry so the popstate handler can identify
  // the active step when the user presses the browser back button.
  useEffect(() => {
    window.history.replaceState(
      { checkoutStep: readSessionStep() },
      "",
      "/checkout",
    )
  }, [])

  // Intercept the browser back gesture: navigate within the wizard or go to cart.
  useEffect(() => {
    function handlePopState(event: PopStateEvent) {
      const previousStep = event.state?.checkoutStep as
        | CheckoutStepId
        | undefined
      if (previousStep && VALID_STEPS.has(previousStep)) {
        setWizardStepRaw(previousStep)
        sessionStorage.setItem(CHECKOUT_STEP_KEY, previousStep)
      } else {
        sessionStorage.removeItem(CHECKOUT_STEP_KEY)
        sessionStorage.removeItem(ADDRESS_KEY)
        router.push("/cart")
      }
    }
    window.addEventListener("popstate", handlePopState)
    return () => window.removeEventListener("popstate", handlePopState)
  }, [router])

  const [isVerifiedPro, setIsVerifiedPro] = useState<boolean | null>(null)

  useEffect(() => {
    let cancelled = false
    async function checkProStatus() {
      if (!user?.id) {
        if (!cancelled) setIsVerifiedPro(false)
        return
      }
      try {
        const supabase = createClient()
        const { data } = await supabase
          .from("profiles")
          .select("verification_status, role")
          .eq("id", user.id)
          .single()
        if (cancelled) return
        if (!data) {
          setIsVerifiedPro(false)
          return
        }
        setIsVerifiedPro(
          data.verification_status === "approved" ||
            data.verification_status === "verified" ||
            data.role === "admin",
        )
      } catch {
        if (!cancelled) setIsVerifiedPro(false)
      }
    }
    void checkProStatus()
    return () => {
      cancelled = true
    }
  }, [user?.id])

  const [savedCard, setSavedCard] = useState<SavedCardMeta | null>(null)
  const [address, setAddress] = useState<CheckoutAddress | null>(
    readSessionAddress,
  )

  useEffect(() => {
    if (address) {
      sessionStorage.setItem(ADDRESS_KEY, JSON.stringify(address))
    } else {
      sessionStorage.removeItem(ADDRESS_KEY)
    }
  }, [address])

  const [termsAccepted, setTermsAccepted] = useState(false)
  const [shippingMethod, setShippingMethod] =
    useState<ShippingMethod>("standard")
  const [cachedShippingRates, setCachedShippingRates] = useState<
    ShippingRate[] | null
  >(null)
  const [taxRate, setTaxRate] = useState(TAX_RATE)

  const userId = user?.id
  useEffect(() => {
    if (!userId) return
    fetchSavedCard()
      .then(setSavedCard)
      .catch(() => {})
  }, [userId])

  const priceSheet = buildPriceSheet(
    toPriceSheetItems(items),
    shippingMethod,
    false,
    taxRate,
  )

  // Gate: only items explicitly flagged isProfessional require verification.
  const gatedItems = items.filter((i) => i.isProfessional && !i.unavailable)
  const showGate =
    isVerifiedPro !== null && gatedItems.length > 0 && !isVerifiedPro

  const hasNonReturnable = items.some(
    (i) => !i.unavailable && i.isReturnable === false,
  )

  // Synchronously derived from the Zustand address store (localStorage persist).
  // Used to show the SavedAddressBanner without an async fetch.
  const preloadedCheckoutAddress: CheckoutAddress | null = savedAddress
    ? {
        fullName: savedAddress.fullName ?? "",
        email: dbProfile?.email ?? "",
        phone: savedAddress.phone ?? "",
        streetLine1: savedAddress.line1 ?? "",
        streetLine2: "",
        city: savedAddress.city ?? "",
        state: savedAddress.region ?? "",
        zip: savedAddress.postalCode ?? "",
        country: "US",
      }
    : null

  function continueFromInfo(addr: CheckoutAddress, terms: boolean) {
    setAddress(addr)
    setTermsAccepted(terms)
    setWizardStep("shipping")

    fetchTaxRate(addr.zip, addr.state)
      .then((rate) => {
        if (rate !== null) setTaxRate(rate)
      })
      .catch(() => {})

    if (user) {
      saveAddress({
        fullName: addr.fullName,
        phone: addr.phone,
        line1: addr.streetLine1,
        city: addr.city,
        region: addr.state,
        postalCode: addr.zip,
        country: addr.country,
      })
      saveDefaultAddress(addr).catch(console.error)
    }
  }

  function continueFromShipping(method: ShippingMethod) {
    setShippingMethod(method)
    setWizardStep("payment")
  }

  async function submitPayment(
    sourceId: string,
    turnstileToken: string,
    surchargeConsented: boolean,
    saveCardConsented: boolean,
  ): Promise<PlaceOrderResponse> {
    if (!address) {
      return { ok: false, error: "Address missing", code: "TAMPER" }
    }

    const data = await placeOrder({
      items: toLineItems(items),
      shippingMethod,
      address,
      termsAccepted,
      surchargeConsented,
      saveCardConsented,
      turnstileToken,
      sourceId,
      ...(!user ? { guestEmail: address.email } : {}),
    })

    if (data.ok) {
      clearCart()
      sessionStorage.removeItem(CHECKOUT_STEP_KEY)
      sessionStorage.removeItem(ADDRESS_KEY)
      router.push(
        `/confirmation?orderId=${data.orderId}&orderNumber=${data.orderNumber}`,
      )
    }
    return data
  }

  return {
    items,
    wizardStep,
    setWizardStep,
    goToCart: () => {
      sessionStorage.removeItem(CHECKOUT_STEP_KEY)
      sessionStorage.removeItem(ADDRESS_KEY)
      router.push("/cart")
    },
    showGate,
    gatedItems,
    isAuthenticated: !!user,
    removeProItems: () =>
      gatedItems.forEach((i) => removeItem(i.variationId ?? i.id)),
    hasNonReturnable,
    infoDefaults: resolveInfoDefaults({
      address,
      termsAccepted,
      isAuthenticated: !!user,
      savedAddress,
      dbProfile,
    }),
    address,
    preloadedCheckoutAddress,
    lineItems: toLineItems(items),
    priceSheet,
    cachedShippingRates,
    setCachedShippingRates,
    isUserLoading,
    savedCard,
    continueFromInfo,
    continueFromShipping,
    submitPayment,
  }
}

type InfoDefaultsArgs = {
  address: CheckoutAddress | null
  termsAccepted: boolean
  isAuthenticated: boolean
  savedAddress: ReturnType<typeof useUser>["savedAddress"]
  dbProfile: ReturnType<typeof useUser>["dbProfile"]
}

function resolveInfoDefaults({
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
