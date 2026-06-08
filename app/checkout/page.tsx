import type { Metadata } from "next"
import { CheckoutNavbar } from "@/components/checkout/checkout-navbar"
import { CheckoutClient } from "@/components/checkout/checkout-client"

export const metadata: Metadata = {
  title: "Secure Payment · METAMORFOSIS LAB",
  description: "Complete your purchase securely at METAMORFOSIS LAB.",
}

export default function CheckoutPage() {
  return (
    <main className="min-h-dvh bg-background">
      <CheckoutNavbar />
      <CheckoutClient />
    </main>
  )
}
