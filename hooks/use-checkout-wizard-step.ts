"use client"

import { startTransition, useCallback, useEffect, useState } from "react"
import { useRouter, useSearchParams } from "next/navigation"

import type { CheckoutStepId } from "@/lib/types"
import {
  CHECKOUT_STEP_KEY,
  VALID_STEPS,
  readSessionStep,
} from "@/lib/checkout/checkout-helpers"

/**
 * Owns the checkout wizard step, kept in sync with the `?step=` URL param and
 * sessionStorage so refreshes and back/forward navigation land on the right step.
 */
export function useCheckoutWizardStep() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const stepParam = searchParams.get("step")

  const [wizardStep, setWizardStepRaw] = useState<CheckoutStepId>(() => {
    if (stepParam && VALID_STEPS.has(stepParam))
      return stepParam as CheckoutStepId
    return readSessionStep()
  })

  useEffect(() => {
    if (stepParam && VALID_STEPS.has(stepParam)) {
      startTransition(() => setWizardStepRaw(stepParam as CheckoutStepId))
      sessionStorage.setItem(CHECKOUT_STEP_KEY, stepParam)
    } else if (stepParam === null) {
      const saved = readSessionStep()
      startTransition(() => setWizardStepRaw(saved))
      window.history.replaceState(null, "", `/checkout?step=${saved}`)
    }
  }, [stepParam])

  const setWizardStep = useCallback(
    (step: CheckoutStepId) => {
      sessionStorage.setItem(CHECKOUT_STEP_KEY, step)
      setWizardStepRaw(step)
      router.push(`/checkout?step=${step}`)
    },
    [router],
  )

  return { wizardStep, setWizardStep }
}
