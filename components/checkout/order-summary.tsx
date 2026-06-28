import { Tag, Truck } from "lucide-react"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import { OrderSummaryItems } from "@/components/checkout/order-summary-items"
import { formatUSD } from "@/lib/utils/format"
import { cn } from "@/lib/utils"
import { type CartItem, type CheckoutStepId } from "@/lib/checkout"
import type { PriceSheet } from "@/lib/checkout/types"

interface OrderSummaryProps {
  items: CartItem[]
  priceSheet: PriceSheet
  wizardStep: CheckoutStepId
  onPlaceOrder: () => void
}

export function OrderSummary({
  items,
  priceSheet,
  wizardStep,
  onPlaceOrder,
}: OrderSummaryProps) {
  const {
    subtotalCents,
    discountCents,
    shippingCents,
    taxCents,
    surchargeCents,
    totalCents,
  } = priceSheet
  const isPaymentStep = wizardStep === "payment"
  const ctaLabel = isPaymentStep ? "Place Secure Order" : null

  return (
    <aside className="lg:sticky lg:top-24">
      <div className="border-border bg-card rounded-xl border p-5 sm:p-6">
        <OrderSummaryItems items={items} />

        {discountCents > 0 && (
          <div className="mt-5">
            <Badge variant="success" className="gap-1.5">
              <Tag className="h-3 w-3" />
              Professional Discount Applied
            </Badge>
          </div>
        )}

        <Separator className="my-5" />

        <dl className="space-y-3 text-sm">
          <div className="flex items-center justify-between">
            <dt className="text-muted-foreground">Subtotal</dt>
            <dd className="text-foreground font-medium tabular-nums">
              {formatUSD(subtotalCents)}
            </dd>
          </div>
          {discountCents > 0 && (
            <div className="flex items-center justify-between">
              <dt className="text-muted-foreground">Professional discount</dt>
              <dd className="font-medium text-emerald-600 tabular-nums">
                -{formatUSD(discountCents)}
              </dd>
            </div>
          )}
          {wizardStep === "payment" && (
            <div className="flex items-center justify-between">
              <dt className="text-muted-foreground flex items-center gap-1.5">
                <Truck className="h-4 w-4" />
                Shipping
              </dt>
              <dd
                className={cn(
                  "font-medium tabular-nums",
                  shippingCents === 0
                    ? "tracking-wide text-emerald-600 uppercase"
                    : "text-foreground",
                )}
              >
                {shippingCents === 0 ? "Free" : formatUSD(shippingCents)}
              </dd>
            </div>
          )}
          <div className="flex items-center justify-between">
            <dt className="text-muted-foreground">Estimated tax</dt>
            <dd className="text-foreground font-medium tabular-nums">
              {formatUSD(taxCents)}
            </dd>
          </div>
          {surchargeCents > 0 && (
            <div className="flex items-center justify-between">
              <dt className="text-muted-foreground">
                Card processing fee (2.6%)
              </dt>
              <dd className="text-foreground font-medium tabular-nums">
                {formatUSD(surchargeCents)}
              </dd>
            </div>
          )}
        </dl>

        <Separator className="my-5" />

        <div className="flex items-end justify-between">
          <span className="text-foreground text-sm font-medium">Total</span>
          <span className="text-foreground text-2xl font-semibold tracking-tight tabular-nums">
            {formatUSD(totalCents)}
          </span>
        </div>

        {ctaLabel && (
          <Button
            type="button"
            variant="default"
            onClick={onPlaceOrder}
            className="mt-5 h-12 w-full"
          >
            {ctaLabel}
          </Button>
        )}

        <p className="text-muted-foreground mt-3 text-center text-xs">
          Powered by METAMORFOSIS LAB · 256-bit SSL secured
        </p>
      </div>
    </aside>
  )
}
