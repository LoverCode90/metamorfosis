"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { ArrowLeft } from "lucide-react"
import type { CheckoutStepId } from "@/lib/types"
import type {
  CheckoutAddress,
  ShippingMethod,
  ShippingRate,
  PlaceOrderResponse,
} from "@/lib/checkout/types"
import { useCart } from "@/hooks/use-cart"
import { useUser } from "@/hooks/use-user"
import { computeTotalsWithShipping } from "@/lib/utils/totals"
import { CheckoutStepper } from "./checkout-stepper"
import { CheckoutGate } from "./checkout-gate"
import { OrderSummary } from "./order-summary"
import { StepInfo } from "./steps/step-info"
import { StepShipping } from "./steps/step-shipping"
import { StepPayment } from "./steps/step-payment"

export function CheckoutClient() {
  const router = useRouter()
  const { items, totals, clearCart, removeItem } = useCart()
  const { user, dbProfile, savedAddress, saveAddress } = useUser()

  const [wizardStep, setWizardStep] = useState<CheckoutStepId>("info")
  const [address, setAddress] = useState<CheckoutAddress | null>(null)
  const [termsAccepted, setTermsAccepted] = useState(false)
  const [shippingMethod, setShippingMethod] =
    useState<ShippingMethod>("standard")
  const [shippingCents, setShippingCents] = useState(0)
  const [cachedShippingRates, setCachedShippingRates] = useState<
    ShippingRate[] | null
  >(null)

  const liveTotals = computeTotalsWithShipping(items, shippingCents)

  // ── Checkout gate — professional-only items ────────────────────────────────
  // Only products explicitly flagged isProfessional require verification.
  // Color products (isColorProduct) are open to everyone — verification only
  // unlocks the $2/per-color-item discount, applied server-side in checkout.
  const gatedItems = items.filter((i) => i.isProfessional && !i.unavailable)
  const isApproved = dbProfile?.verification_status === "approved"

  if (gatedItems.length > 0 && (!user || !isApproved)) {
    return (
      <div className="mx-auto max-w-6xl px-4 py-16 sm:px-6">
        <CheckoutGate
          proItems={gatedItems}
          isAuthenticated={!!user}
          onRemovePro={() => {
            gatedItems.forEach((i) => removeItem(i.variationId ?? i.id))
          }}
        />
      </div>
    )
  }

  const hasNonReturnable = items.some((i) => !i.unavailable)

  function handleInfoContinue(addr: CheckoutAddress, terms: boolean) {
    setAddress(addr)
    setTermsAccepted(terms)
    setWizardStep("shipping")

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
      fetch("/api/addresses/default", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(addr),
      }).catch(console.error)
    }
  }

  function handleShippingContinue(method: ShippingMethod, cents: number) {
    setShippingMethod(method)
    setShippingCents(cents)
    setWizardStep("payment")
  }

  async function handlePaymentSubmit(
    sourceId: string,
    turnstileToken: string,
  ): Promise<PlaceOrderResponse> {
    if (!address) {
      return { ok: false, error: "Address missing", code: "TAMPER" }
    }

    const payload = {
      items: items
        .filter((i) => !i.unavailable && i.variationId)
        .map((i) => ({ variationId: i.variationId, quantity: i.quantity })),
      shippingMethod,
      address,
      termsAccepted,
      turnstileToken,
      sourceId,
      ...(!user ? { guestEmail: address.email } : {}),
    }

    const res = await fetch("/api/checkout/validate-payment", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    })

    const data = (await res.json()) as PlaceOrderResponse

    if (data.ok) {
      clearCart()
      router.push(
        `/confirmation?orderId=${data.orderId}&orderNumber=${data.orderNumber}`,
      )
    }

    return data
  }

  // When returning from shipping step, restore the full address the user entered
  // so their edits are not lost. On first visit, seed name/email/phone from profile.
  const infoDefaults = address
    ? {
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
    : user && savedAddress
      ? {
          fullName: savedAddress.fullName,
          email: dbProfile?.email || "",
          phone: savedAddress.phone || dbProfile?.phone_number || "",
          streetLine1: savedAddress.line1 || "",
          streetLine2: "",
          city: savedAddress.city || "",
          state: savedAddress.region || "",
          zip: savedAddress.postalCode || "",
        }
      : user && dbProfile
        ? {
            fullName: dbProfile.full_name,
            email: dbProfile.email,
            phone: dbProfile.phone_number ?? "",
          }
        : undefined

  return (
    <div className="mx-auto max-w-6xl overflow-x-hidden px-4 py-8 sm:px-6 sm:py-10">
      <button
        type="button"
        onClick={() => router.push("/cart")}
        className="text-muted-foreground hover:text-foreground mb-6 inline-flex items-center gap-1.5 text-sm font-medium transition-colors"
      >
        <ArrowLeft className="h-4 w-4" strokeWidth={1.75} />
        Return to cart
      </button>

      <div className="mb-10">
        <CheckoutStepper activeStep={wizardStep} />
      </div>

      <div className="grid gap-10 lg:grid-cols-[1fr_400px] lg:gap-14">
        <div className="order-1 min-w-0">
          {wizardStep === "info" && (
            <StepInfo
              hasNonReturnable={hasNonReturnable}
              defaultValues={infoDefaults}
              isAuthenticated={!!user}
              skipAddressFetch={address !== null}
              onContinue={handleInfoContinue}
            />
          )}
          {wizardStep === "shipping" && address && (
            <StepShipping
              subtotalCents={Math.round(totals.subtotal * 100)}
              address={address}
              variationIds={items
                .filter((i) => !i.unavailable && i.variationId)
                .map((i) => i.variationId)}
              initialRates={cachedShippingRates}
              onRatesFetched={(rates) => setCachedShippingRates(rates)}
              onContinue={handleShippingContinue}
              onBack={() => setWizardStep("info")}
            />
          )}
          {wizardStep === "payment" && (
            <StepPayment
              totalCents={Math.round(liveTotals.total * 100)}
              onBack={() => setWizardStep("shipping")}
              onSubmit={handlePaymentSubmit}
            />
          )}
        </div>

        <div className="order-2 min-w-0">
          <OrderSummary
            items={items}
            totals={liveTotals}
            wizardStep={wizardStep}
            onPlaceOrder={() => {}}
          />
        </div>
      </div>
    </div>
  )
}
