"use client"

import { useEffect } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { useCart } from "@/hooks/use-cart"

export function useConfirmationGuard() {
  const router = useRouter()
  const params = useSearchParams()
  const { clearCart } = useCart()
  const orderNumber = params.get("orderNumber")
  const orderId = params.get("orderId")

  useEffect(() => {
    clearCart()

    // Push a dummy entry so the back button has somewhere to "go"
    window.history.pushState(null, "", window.location.href)

    function onPopState() {
      // User pressed back — redirect to home instead of letting them reach checkout or cart
      window.history.pushState(null, "", window.location.href)
      router.replace("/")
    }

    window.addEventListener("popstate", onPopState)
    return () => window.removeEventListener("popstate", onPopState)
  }, [router, clearCart])

  function handleBackToHome() {
    router.push("/")
  }

  return {
    orderNumber,
    orderId,
    handleBackToHome,
  }
}
