import { Tag, Truck } from "lucide-react"
import {
  ORDER_ITEMS,
  computeTotals,
  formatUSD,
  type PaymentVariant,
} from "@/lib/checkout"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { cn } from "@/lib/utils"

interface OrderSummaryProps {
  variant: PaymentVariant
  onPlaceOrder: () => void
}

export function OrderSummary({ variant, onPlaceOrder }: OrderSummaryProps) {
  const { subtotal, discount, total } = computeTotals(ORDER_ITEMS)
  const disabled = variant === "expired"

  return (
    <aside className="lg:sticky lg:top-8">
      <div className="rounded-xl border border-border bg-card p-5 sm:p-6">
        {/* Product rows */}
        <ul className="space-y-5">
          {ORDER_ITEMS.map((item) => (
            <li key={item.id} className="flex gap-4">
              <div className="relative h-16 w-16 shrink-0 overflow-hidden rounded-lg border border-border bg-muted">
                <img
                  src={item.image || "/placeholder.svg"}
                  alt={item.name}
                  className="h-full w-full object-cover"
                />
                <span className="absolute -right-1.5 -top-1.5 flex h-5 w-5 items-center justify-center rounded-full bg-foreground text-[11px] font-semibold text-background">
                  {item.quantity}
                </span>
              </div>
              <div className="flex min-w-0 flex-1 items-start justify-between gap-2">
                <div className="min-w-0">
                  <p className="truncate text-sm font-medium text-foreground">
                    {item.name}
                  </p>
                  <p className="mt-0.5 text-xs text-muted-foreground">
                    {item.variant}
                  </p>
                </div>
                <p className="text-sm font-semibold text-foreground tabular-nums">
                  {formatUSD(item.unitPrice * item.quantity)}
                </p>
              </div>
            </li>
          ))}
        </ul>

        <div className="mt-5">
          <Badge className="gap-1.5 border-transparent bg-emerald-600 text-white hover:bg-emerald-600">
            <Tag className="h-3 w-3" />
            Professional Discount Applied (-$2.00 per item)
          </Badge>
        </div>

        <Separator className="my-5" />

        {/* Financial breakdown */}
        <dl className="space-y-3 text-sm">
          <div className="flex items-center justify-between">
            <dt className="text-muted-foreground">Subtotal</dt>
            <dd className="font-medium text-foreground tabular-nums">
              {formatUSD(subtotal)}
            </dd>
          </div>
          <div className="flex items-center justify-between">
            <dt className="text-muted-foreground">Professional discount</dt>
            <dd className="font-medium text-emerald-600 tabular-nums">
              -{formatUSD(discount)}
            </dd>
          </div>
          <div className="flex items-center justify-between">
            <dt className="flex items-center gap-1.5 text-muted-foreground">
              <Truck className="h-4 w-4" />
              Shipping
            </dt>
            <dd className="font-medium uppercase tracking-wide text-emerald-600">
              Free
            </dd>
          </div>
        </dl>

        <Separator className="my-5" />

        <div className="flex items-end justify-between">
          <span className="text-sm font-medium text-foreground">Total</span>
          <span className="text-2xl font-semibold tracking-tight text-foreground tabular-nums">
            {formatUSD(total)}
          </span>
        </div>

        <button
          type="button"
          onClick={onPlaceOrder}
          disabled={disabled}
          className={cn(
            "mt-5 h-12 w-full rounded-md bg-foreground text-sm font-semibold text-background transition-opacity",
            "hover:opacity-90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
            disabled && "cursor-not-allowed opacity-40 hover:opacity-40",
          )}
        >
          {disabled ? "Update Card to Continue" : "Place Secure Order"}
        </button>

        <p className="mt-3 text-center text-xs text-muted-foreground">
          Powered by METAMORFOSIS LAB · 256-bit SSL secured
        </p>
      </div>
    </aside>
  )
}
