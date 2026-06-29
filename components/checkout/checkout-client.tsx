"use client"

import { ArrowLeft } from "lucide-react"

import { Button } from "@/components/ui/button"
import { CheckoutGate } from "@/components/checkout/checkout-gate"
import { CheckoutStepper } from "@/components/checkout/checkout-stepper"
import { OrderSummary } from "@/components/checkout/order-summary"
import { StepInfo } from "@/components/checkout/steps/step-info"
import { StepPayment } from "@/components/checkout/steps/step-payment"
import { StepShipping } from "@/components/checkout/steps/step-shipping"
import { useCheckoutFlow } from "@/hooks/use-checkout-flow"

/**
 * Checkout wizard shell: renders the active step (info → shipping → payment)
 * and the order summary, or the professional-items gate when required. All
 * state and side effects live in {@link useCheckoutFlow}.
 */
export function CheckoutClient() {
  const flow = useCheckoutFlow()

  if (flow.showGate) {
    return (
      <div className="mx-auto max-w-6xl px-4 py-16 sm:px-6">
        <CheckoutGate
          proItems={flow.gatedItems}
          isAuthenticated={flow.isAuthenticated}
          onRemovePro={flow.removeProItems}
        />
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-6xl overflow-x-hidden px-4 py-8 sm:px-6 sm:py-10">
      <Button
        variant="ghost"
        size="sm"
        onClick={flow.goToCart}
        className="text-muted-foreground mb-6"
      >
        <ArrowLeft className="h-4 w-4" strokeWidth={1.75} />
        Return to cart
      </Button>

      <div className="mb-10">
        <CheckoutStepper activeStep={flow.wizardStep} />
      </div>

      <div className="grid gap-10 lg:grid-cols-[1fr_400px] lg:gap-14">
        <div className="order-1 min-w-0">
          {flow.wizardStep === "info" && (
            <StepInfo
              defaultValues={flow.infoDefaults}
              preloadedAddress={flow.address ?? flow.preloadedCheckoutAddress}
              isUserLoading={flow.isUserLoading}
              onContinue={flow.continueFromInfo}
            />
          )}
          {flow.wizardStep === "shipping" && flow.address && (
            <StepShipping
              subtotalCents={flow.priceSheet.subtotalCents}
              address={flow.address}
              cartItems={flow.lineItems}
              initialRates={flow.cachedShippingRates}
              onRatesFetched={flow.setCachedShippingRates}
              onContinue={flow.continueFromShipping}
              onBack={() => flow.setWizardStep("info")}
            />
          )}
          {flow.wizardStep === "payment" && (
            <StepPayment
              totalCents={flow.priceSheet.totalCents}
              surchargeCents={flow.priceSheet.surchargeCents}
              savedCard={flow.savedCard}
              onBack={() => flow.setWizardStep("shipping")}
              onSubmit={flow.submitPayment}
            />
          )}
        </div>

        <div className="order-2 min-w-0">
          <OrderSummary
            items={flow.items}
            priceSheet={flow.priceSheet}
            wizardStep={flow.wizardStep}
            onPlaceOrder={() => {}}
          />
        </div>
      </div>
    </div>
  )
}
