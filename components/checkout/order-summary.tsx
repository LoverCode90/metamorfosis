/* eslint-disable @next/next/no-img-element */
import Link from "next/link"
import { Tag, Truck } from "lucide-react"
import { type CartItem, type CheckoutStepId } from "@/lib/checkout"
import { formatUSD } from "@/lib/utils/format"
import type { PriceSheet } from "@/lib/checkout/types"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { cn } from "@/lib/utils"

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
        {/* Product rows */}
        <ul className="space-y-5">
          {items.map((item) => (
            <li key={item.id} className="flex gap-4">
              <div className="border-border bg-muted relative h-16 w-16 shrink-0 overflow-hidden rounded-lg border">
                <img
                  src={item.image || "/placeholder.svg"}
                  alt={item.name}
                  className="h-full w-full object-cover"
                />
                <span className="bg-foreground text-background absolute -top-1.5 -right-1.5 flex h-5 w-5 items-center justify-center rounded-full text-[11px] font-semibold">
                  {item.quantity}
                </span>
              </div>
              <div className="flex min-w-0 flex-1 items-start justify-between gap-2">
                <div className="min-w-0">
                  <Link
                    href={`/products/${item.id}`}
                    className="text-foreground block truncate text-sm font-medium hover:underline"
                  >
                    {item.name}
                  </Link>
                  <p className="text-muted-foreground mt-0.5 text-xs">
                    {item.variant}
                  </p>
                </div>
                <p className="text-foreground text-sm font-semibold tabular-nums">
                  {formatUSD(item.unitPrice * item.quantity)}
                </p>
              </div>
            </li>
          ))}
        </ul>

        {discountCents > 0 && (
          <div className="mt-5">
            <Badge className="gap-1.5 border-transparent bg-emerald-600 text-white hover:bg-emerald-600">
              <Tag className="h-3 w-3" />
              Professional Discount Applied
            </Badge>
          </div>
        )}

        <Separator className="my-5" />

        {/* Financial breakdown */}
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
          <button
            type="button"
            onClick={onPlaceOrder}
            className="bg-foreground text-background focus-visible:ring-ring mt-5 h-12 w-full rounded-md text-sm font-semibold transition-opacity hover:opacity-90 focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-none"
          >
            {ctaLabel}
          </button>
        )}

        <p className="text-muted-foreground mt-3 text-center text-xs">
          Powered by METAMORFOSIS LAB · 256-bit SSL secured
        </p>
      </div>
    </aside>
  )
}
