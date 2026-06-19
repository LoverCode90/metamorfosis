"use client"

import { useState } from "react"
import { ArrowLeft } from "lucide-react"
import { useRouter } from "next/navigation"
import type { CheckoutStepId } from "@/lib/checkout"
import { computeTotalsWithShipping, shippingFor } from "@/lib/checkout"
import { useCart } from "@/hooks/use-cart"
import { useUser } from "@/hooks/use-user"
import { CheckoutStepper } from "./checkout-stepper"
import { OrderSummary } from "./order-summary"
import { AddressBook } from "./address-book"
import { PaymentSection } from "./payment-section"
import { PaymentToast } from "./payment-toast"
import { StepInfo, type InfoData } from "./steps/step-info"
import { StepShipping, type ShippingMethod } from "./steps/step-shipping"

export function CheckoutClient() {
  const router = useRouter()
  const { items, placeOrder } = useCart()
  const { savedAddress, saveAddress } = useUser()

  const shipping = shippingFor(savedAddress?.country ?? "United States")
  const liveTotals = computeTotalsWithShipping(items, shipping)

  const [wizardStep, setWizardStep] = useState<CheckoutStepId>("info")
  const [infoData, setInfoData] = useState<InfoData | null>(null)
  const [toastOpen, setToastOpen] = useState(false)

  function handleInfoContinue(data: InfoData) {
    setInfoData(data)
    setWizardStep("shipping")
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  function handleShippingContinue(_method: ShippingMethod) {
    setWizardStep("payment")
  }

  function handlePlaceOrder() {
    placeOrder({
      email: infoData?.email ?? "you@email.com",
      shipName: savedAddress?.fullName
        ? savedAddress.fullName
        : infoData
          ? `${infoData.firstName} ${infoData.lastName}`
          : "Valued Customer",
      shipAddress: savedAddress
        ? `${savedAddress.line1}, ${savedAddress.city}, ${savedAddress.country}`
        : (infoData?.address ?? "United States"),
    })
    router.push("/confirmation")
  }

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
            <div className="space-y-8">
              <AddressBook address={savedAddress} onSave={saveAddress} />
              <StepInfo onContinue={handleInfoContinue} />
            </div>
          )}
          {wizardStep === "shipping" && infoData && (
            <StepShipping
              info={infoData}
              onContinue={handleShippingContinue}
              onBack={() => setWizardStep("info")}
            />
          )}
          {wizardStep === "payment" && <PaymentSection />}
        </div>

        <div className="order-2">
          <OrderSummary
            items={items}
            totals={liveTotals}
            wizardStep={wizardStep}
            onPlaceOrder={handlePlaceOrder}
          />
        </div>
      </div>

      <PaymentToast open={toastOpen} onClose={() => setToastOpen(false)} />
    </div>
  )
}
