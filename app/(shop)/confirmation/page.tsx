import type { Metadata } from "next"
import { Suspense } from "react"
import { ConfirmationView } from "@/components/cart/confirmation-view"

export const metadata: Metadata = {
  title: "Order Confirmed — Metamorfosis Beauty",
}

export default function Confirmation() {
  return (
    <Suspense fallback={null}>
      <ConfirmationView />
    </Suspense>
  )
}
