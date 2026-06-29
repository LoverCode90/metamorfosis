"use client"

import { useCallback, useEffect, useState } from "react"
import { useRouter } from "next/navigation"

import { useCart } from "@/hooks/use-cart"
import { useUser } from "@/hooks/use-user"
import { useCheckoutWizardStep } from "@/hooks/use-checkout-wizard-step"
import { useProGateStatus } from "@/hooks/use-pro-gate-status"
import { useCheckoutActions } from "@/hooks/use-checkout-actions"
import { PRO_RESTRICTIONS_ENABLED } from "@/lib/constants"
import { fetchSavedCard } from "@/lib/checkout/checkout-api"
import {
  computeClientPriceSheet,
  toLineItems,
} from "@/lib/checkout/checkout-flow"
import { TAX_RATE } from "@/lib/utils/totals"
import type { CheckoutAddress, LiveShippingRate } from "@/lib/checkout/types"
import type { SavedCardMeta } from "@/components/checkout/steps/step-payment"
import {
  ADDRESS_KEY,
  CHECKOUT_STEP_KEY,
  buildPreloadedAddress,
  readSessionAddress,
  resolveInfoDefaults,
  type UseCheckoutFlowResult,
} from "@/lib/checkout/checkout-helpers"

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
  const userId = user?.id

  const { wizardStep, setWizardStep } = useCheckoutWizardStep()
  const isVerifiedPro = useProGateStatus(userId)

  const [savedCard, setSavedCard] = useState<SavedCardMeta | null>(null)
  const [address, setAddress] = useState<CheckoutAddress | null>(
    readSessionAddress,
  )
  const [termsAccepted, setTermsAccepted] = useState(false)
  const [selectedRate, setSelectedRate] = useState<LiveShippingRate | null>(
    null,
  )
  const [cachedShippingRates, setCachedShippingRates] = useState<
    LiveShippingRate[] | null
  >(null)
  const [taxRate, setTaxRate] = useState(TAX_RATE)

  const selectRate = useCallback(
    (rate: LiveShippingRate) => setSelectedRate(rate),
    [],
  )
  const navigate = useCallback((url: string) => router.push(url), [router])

  useEffect(() => {
    if (address) sessionStorage.setItem(ADDRESS_KEY, JSON.stringify(address))
    else sessionStorage.removeItem(ADDRESS_KEY)
  }, [address])

  useEffect(() => {
    if (!userId) return
    fetchSavedCard()
      .then(setSavedCard)
      .catch(() => {})
  }, [userId])

  const priceSheet = computeClientPriceSheet(items, selectedRate, taxRate)

  const gatedItems = items.filter(
    (item) => item.isProfessional && !item.unavailable,
  )
  const showGate =
    PRO_RESTRICTIONS_ENABLED &&
    isVerifiedPro !== null &&
    gatedItems.length > 0 &&
    !isVerifiedPro

  const { continueFromInfo, continueFromShipping, submitPayment } =
    useCheckoutActions({
      items,
      address,
      selectedRate,
      termsAccepted,
      user,
      saveAddress,
      setAddress,
      setTermsAccepted,
      setTaxRate,
      setWizardStep,
      clearCart,
      navigate,
    })

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
    infoDefaults: resolveInfoDefaults({
      address,
      termsAccepted,
      isAuthenticated: !!user,
      savedAddress,
      dbProfile,
    }),
    address,
    preloadedCheckoutAddress: buildPreloadedAddress(
      savedAddress,
      dbProfile?.email ?? "",
    ),
    lineItems: toLineItems(items),
    priceSheet,
    cachedShippingRates,
    setCachedShippingRates,
    selectedRate,
    selectRate,
    isUserLoading,
    savedCard,
    continueFromInfo,
    continueFromShipping,
    submitPayment,
  }
}
