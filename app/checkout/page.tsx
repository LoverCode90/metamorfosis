import type { Metadata } from "next"
import { CheckoutClient } from "@/components/checkout/checkout-client"

export const metadata: Metadata = {
  title: "Checkout — Metamorfosis Beauty",
}

export default function CheckoutPage() {
  return (
    <div className="overflow-x-hidden">
      <CheckoutClient />
    </div>
  )
}
