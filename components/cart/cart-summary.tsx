"use client"

import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import { FreeShippingBar } from "@/components/cart/free-shipping-bar"
import { OrderTotals } from "@/components/cart/order-totals"
import { PromoCode } from "@/components/cart/promo-code"
import { FREE_SHIPPING_THRESHOLD_CENTS } from "@/lib/constants"
import { formatUSD } from "@/lib/utils/format"
import type { Totals } from "@/lib/types"

interface CartSummaryProps {
  totals: Totals
  onCheckout: () => void
  onContinueShopping: () => void
  disabled?: boolean
}

/**
 * Cart order summary: free-shipping progress, promo entry, the cost breakdown,
 * and the checkout / continue-shopping actions.
 */
export function CartSummary({
  totals,
  onCheckout,
  onContinueShopping,
  disabled,
}: CartSummaryProps) {
  // Real shipping is computed by Shippo at checkout; here we only know whether
  // the order already qualifies for free standard shipping.
  const qualifiesForFreeShipping =
    totals.subtotal - totals.discount >= FREE_SHIPPING_THRESHOLD_CENTS

  return (
    <aside className="lg:sticky lg:top-24">
      <div className="border-border bg-card rounded-xl border p-4 sm:p-6">
        <h2 className="text-foreground text-lg font-semibold tracking-tight">
          Order Summary
        </h2>

        <FreeShippingBar subtotalCents={totals.subtotal} />
        <PromoCode />

        <Separator className="my-4 sm:my-5" />
        <OrderTotals
          totals={totals}
          qualifiesForFreeShipping={qualifiesForFreeShipping}
        />
        <Separator className="my-4 sm:my-5" />

        <div className="flex items-end justify-between">
          <span className="text-foreground text-sm font-medium">Total</span>
          <span className="text-foreground text-xl font-semibold tracking-tight tabular-nums sm:text-2xl">
            {formatUSD(totals.total)}
          </span>
        </div>

        <Button
          variant="accent"
          onClick={onCheckout}
          disabled={disabled}
          className="mt-4 h-11 w-full sm:mt-5 sm:h-12"
        >
          Continue to checkout
        </Button>
        <Button
          variant="outline"
          onClick={onContinueShopping}
          className="mt-2.5 h-11 w-full sm:mt-3 sm:h-12"
        >
          Continue Shopping
        </Button>
      </div>
    </aside>
  )
}
