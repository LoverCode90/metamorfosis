"use client"

import { useCallback } from "react"

import {
  fetchTaxRate,
  placeOrder,
  saveDefaultAddress,
} from "@/lib/checkout/checkout-api"
import { toLineItems } from "@/lib/checkout/checkout-flow"
import { ADDRESS_KEY, CHECKOUT_STEP_KEY } from "@/lib/checkout/checkout-helpers"
import type { CartItem } from "@/lib/types"
import type {
  CheckoutAddress,
  LiveShippingRate,
  PlaceOrderResponse,
} from "@/lib/checkout/types"
import type { CheckoutStepId } from "@/lib/types"
import type { useUser } from "@/hooks/use-user"

interface CheckoutActionsDeps {
  items: CartItem[]
  address: CheckoutAddress | null
  selectedRate: LiveShippingRate | null
  termsAccepted: boolean
  user: ReturnType<typeof useUser>["user"]
  saveAddress: ReturnType<typeof useUser>["saveAddress"]
  setAddress: (address: CheckoutAddress) => void
  setTermsAccepted: (accepted: boolean) => void
  setTaxRate: (rate: number) => void
  setWizardStep: (step: CheckoutStepId) => void
  clearCart: () => void
  navigate: (url: string) => void
}

/** Checkout step transitions and the final order submission. */
export function useCheckoutActions(deps: CheckoutActionsDeps) {
  const {
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
  } = deps

  const continueFromInfo = useCallback(
    (nextAddress: CheckoutAddress, terms: boolean) => {
      setAddress(nextAddress)
      setTermsAccepted(terms)
      setWizardStep("shipping")

      fetchTaxRate(nextAddress.zip, nextAddress.state)
        .then((rate) => {
          if (rate !== null) setTaxRate(rate)
        })
        .catch(() => {})

      if (user) {
        saveAddress({
          fullName: nextAddress.fullName,
          phone: nextAddress.phone,
          line1: nextAddress.streetLine1,
          city: nextAddress.city,
          region: nextAddress.state,
          postalCode: nextAddress.zip,
          country: nextAddress.country,
        })
        saveDefaultAddress(nextAddress).catch(console.error)
      }
    },
    [
      user,
      saveAddress,
      setAddress,
      setTermsAccepted,
      setTaxRate,
      setWizardStep,
    ],
  )

  const continueFromShipping = useCallback(
    () => setWizardStep("payment"),
    [setWizardStep],
  )

  const submitPayment = useCallback(
    async (
      sourceId: string,
      turnstileToken: string,
      surchargeConsented: boolean,
      saveCardConsented: boolean,
    ): Promise<PlaceOrderResponse> => {
      if (!address) {
        return { ok: false, error: "Address missing", code: "TAMPER" }
      }
      if (!selectedRate) {
        return { ok: false, error: "Select a shipping method", code: "TAMPER" }
      }

      const data = await placeOrder({
        items: toLineItems(items),
        shippoRateId: selectedRate.shippo_rate_id,
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
        navigate(
          `/confirmation?orderId=${data.orderId}&orderNumber=${data.orderNumber}`,
        )
      }
      return data
    },
    [address, selectedRate, items, termsAccepted, user, clearCart, navigate],
  )

  return { continueFromInfo, continueFromShipping, submitPayment }
}
