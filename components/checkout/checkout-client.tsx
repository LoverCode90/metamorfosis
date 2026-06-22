"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { ArrowLeft } from "lucide-react"
import type { CheckoutStepId } from "@/lib/types"
import type {
  CheckoutAddress,
  ShippingMethod,
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
  const { user, dbProfile } = useUser()

  const [wizardStep, setWizardStep] = useState<CheckoutStepId>("info")
  const [address, setAddress] = useState<CheckoutAddress | null>(null)
  const [termsAccepted, setTermsAccepted] = useState(false)
  const [shippingMethod, setShippingMethod] =
    useState<ShippingMethod>("standard")
  const [shippingCents, setShippingCents] = useState(0)

  const liveTotals = computeTotalsWithShipping(items, shippingCents)

  // ── Checkout gate — restricted (professional OR color) items ───────────────
  // Any color or professional item requires an APPROVED verification status.
  // Pending / rejected / not_applicable (and guests) are blocked.
  const gatedItems = items.filter(
    (i) => (i.isProfessional || i.isColorProduct) && !i.unavailable,
  )
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

  // Profile-level defaults (name, email, phone from profile row).
  // The saved address (street, city, etc.) is fetched inside StepInfo.
  const infoDefaults =
    user && dbProfile
      ? {
          fullName: dbProfile.full_name,
          email: dbProfile.email,
          phone: dbProfile.phone_number ?? "",
        }
      : undefined

  return (
    <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6 sm:py-10">
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
        <div className="order-1">
          {wizardStep === "info" && (
            <StepInfo
              hasNonReturnable={hasNonReturnable}
              defaultValues={infoDefaults}
              isAuthenticated={!!user}
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

        <div className="order-2">
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
