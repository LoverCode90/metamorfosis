import { Check, ShieldCheck, ShoppingBag, Truck, User } from "lucide-react"
import type { LucideIcon } from "lucide-react"
import { CHECKOUT_STEPS, type CheckoutStepId } from "@/lib/checkout"
import { cn } from "@/lib/utils"

const STEP_ICONS: Record<CheckoutStepId, LucideIcon> = {
  cart: ShoppingBag,
  info: User,
  shipping: Truck,
  payment: ShieldCheck,
}

interface CheckoutStepperProps {
  activeStep: CheckoutStepId
}

export function CheckoutStepper({ activeStep }: CheckoutStepperProps) {
  const activeIndex = CHECKOUT_STEPS.findIndex((s) => s.id === activeStep)

  return (
    <nav aria-label="Checkout progress" className="w-full">
      <ol className="flex items-center">
        {CHECKOUT_STEPS.map((step, index) => {
          const Icon = STEP_ICONS[step.id]
          const isComplete = index < activeIndex
          const isActive = index === activeIndex
          const isLast = index === CHECKOUT_STEPS.length - 1

          return (
            <li
              key={step.id}
              className={cn("flex items-center", !isLast && "flex-1")}
            >
              <div className="flex items-center gap-2.5">
                <span
                  className={cn(
                    "flex h-9 w-9 shrink-0 items-center justify-center rounded-full border transition-colors",
                    isActive &&
                      "border-foreground bg-foreground text-background",
                    isComplete &&
                      "border-foreground/20 bg-foreground/5 text-foreground",
                    !isActive &&
                      !isComplete &&
                      "border-border text-muted-foreground",
                  )}
                >
                  {isComplete ? (
                    <Check className="h-4 w-4" strokeWidth={2.5} />
                  ) : (
                    <Icon className="h-4 w-4" strokeWidth={2} />
                  )}
                </span>
                <span
                  className={cn(
                    "text-sm font-medium",
                    isActive && "text-foreground",
                    !isActive && "text-muted-foreground",
                  )}
                >
                  <span className="hidden sm:inline">{step.label}</span>
                </span>
              </div>

              {!isLast && (
                <span
                  aria-hidden
                  className={cn(
                    "mx-3 h-px flex-1",
                    index < activeIndex ? "bg-foreground/30" : "bg-border",
                  )}
                />
              )}
            </li>
          )
        })}
      </ol>
    </nav>
  )
}
