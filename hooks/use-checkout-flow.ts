"use client"

import { useCallback, useEffect, startTransition, useState } from "react"
import { useRouter, useSearchParams } from "next/navigation"

import { useCart } from "@/hooks/use-cart"
import { useUser } from "@/hooks/use-user"
import { createClient } from "@/lib/supabase/client"
import { PRO_RESTRICTIONS_ENABLED } from "@/lib/constants"
import {
  fetchSavedCard,
  fetchTaxRate,
  placeOrder,
  saveDefaultAddress,
} from "@/lib/checkout/checkout-api"
import { toLineItems, toPriceSheetItems } from "@/lib/checkout/checkout-flow"
import { buildPriceSheet } from "@/lib/checkout/totals"
import { TAX_RATE } from "@/lib/utils/totals"
import type { CheckoutStepId } from "@/lib/types"
import type {
  CheckoutAddress,
  PlaceOrderResponse,
  ShippingMethod,
  ShippingRate,
} from "@/lib/checkout/types"
import type { SavedCardMeta } from "@/components/checkout/steps/step-payment"
import {
  CHECKOUT_STEP_KEY,
  ADDRESS_KEY,
  VALID_STEPS,
  readSessionStep,
  readSessionAddress,
  resolveInfoDefaults,
  type UseCheckoutFlowResult,
} from "@/lib/checkout/checkout-helpers"

export function useCheckoutFlow(): UseCheckoutFlowResult {
  const router = useRouter()
  const searchParams = useSearchParams()
  const stepParam = searchParams.get("step")

  const { items, clearCart, removeItem } = useCart()
  const {
    user,
    dbProfile,
    savedAddress,
    saveAddress,
    isLoading: isUserLoading,
  } = useUser()

  const [wizardStep, setWizardStepRaw] = useState<CheckoutStepId>(() => {
    if (stepParam && VALID_STEPS.has(stepParam))
      return stepParam as CheckoutStepId
    return readSessionStep()
  })

  useEffect(() => {
    if (stepParam && VALID_STEPS.has(stepParam)) {
      startTransition(() => setWizardStepRaw(stepParam as CheckoutStepId))
      sessionStorage.setItem(CHECKOUT_STEP_KEY, stepParam)
    } else if (stepParam === null) {
      const saved = readSessionStep()
      startTransition(() => setWizardStepRaw(saved))
      window.history.replaceState(null, "", `/checkout?step=${saved}`)
    }
  }, [stepParam])

  const setWizardStep = useCallback(
    (step: CheckoutStepId) => {
      sessionStorage.setItem(CHECKOUT_STEP_KEY, step)
      setWizardStepRaw(step)
      router.push(`/checkout?step=${step}`)
    },
    [router],
  )

  const [isVerifiedPro, setIsVerifiedPro] = useState<boolean | null>(null)
  const userId = user?.id

  useEffect(() => {
    let cancelled = false
    async function checkProStatus() {
      if (!userId) {
        if (!cancelled) setIsVerifiedPro(false)
        return
      }
      try {
        const supabase = createClient()
        const { data } = await supabase
          .from("profiles")
          .select("verification_status, role")
          .eq("id", userId)
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
  }, [userId])

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

  const gatedItems = items.filter(
    (item) => item.isProfessional && !item.unavailable,
  )
  const showGate =
    PRO_RESTRICTIONS_ENABLED &&
    isVerifiedPro !== null &&
    gatedItems.length > 0 &&
    !isVerifiedPro
  const hasNonReturnable = items.some(
    (item) => !item.unavailable && item.isReturnable === false,
  )

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
      router.push("/cart")
    },
    showGate,
    gatedItems,
    isAuthenticated: !!user,
    removeProItems: () =>
      gatedItems.forEach((item) => removeItem(item.variationId ?? item.id)),
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
