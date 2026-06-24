/* eslint-disable @next/next/no-img-element */
import Link from "next/link"
import type { DbOrder } from "@/lib/orders/types"
import { fmtDollars } from "./tracking-helpers"

interface TrackingItemsProps {
  order: DbOrder
  canReportProblem: boolean
}

export function TrackingItems({ order, canReportProblem }: TrackingItemsProps) {
  return (
    <section className="border-border bg-card mt-6 rounded-2xl border p-6">
      <h3 className="text-foreground text-sm font-semibold">
        Items in this order
      </h3>
      <ul className="divide-border mt-4 flex flex-col divide-y">
        {order.order_items.map((item) => {
          const lineTotal =
            item.unit_price_cents * item.quantity - item.discount_cents
          return (
            <li key={item.id} className="flex items-center gap-3 py-3">
              <div className="border-border bg-muted h-12 w-12 shrink-0 overflow-hidden rounded-md border">
                {item.product_variations?.image_url ? (
                  <img
                    src={item.product_variations.image_url}
                    alt={item.product_variations.name_en ?? ""}
                    className="h-full w-full object-cover"
                  />
                ) : null}
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-foreground truncate text-sm font-medium">
                  {item.product_variations?.name_en ?? "Item"}
                </p>
                <p className="text-muted-foreground text-xs">
                  Qty {item.quantity}
                  {item.discount_cents > 0 &&
                    ` · ${fmtDollars(item.discount_cents)} pro discount`}
                </p>
              </div>
              <span className="text-foreground text-sm font-semibold tabular-nums">
                {fmtDollars(lineTotal)}
              </span>
            </li>
          )
        })}
      </ul>

      {/* Order totals */}
      <div className="border-border mt-4 space-y-1.5 border-t pt-4">
        <div className="flex justify-between text-sm">
          <span className="text-muted-foreground">Subtotal</span>
          <span className="text-foreground">
            {fmtDollars(order.subtotal_cents)}
          </span>
        </div>
        {order.discount_cents > 0 && (
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Pro discount</span>
            <span className="text-green-500">
              −{fmtDollars(order.discount_cents)}
            </span>
          </div>
        )}
        <div className="flex justify-between text-sm">
          <span className="text-muted-foreground">Shipping</span>
          <span className="text-foreground">
            {order.shipping_cents === 0
              ? "FREE"
              : fmtDollars(order.shipping_cents)}
          </span>
        </div>
        <div className="flex justify-between text-sm">
          <span className="text-muted-foreground">Tax</span>
          <span className="text-foreground">{fmtDollars(order.tax_cents)}</span>
        </div>
        <div className="border-border flex justify-between border-t pt-2 text-sm font-semibold">
          <span className="text-foreground">Total</span>
          <span className="text-foreground">
            {fmtDollars(order.total_cents)}
          </span>
        </div>
      </div>

      {canReportProblem && (
        <div className="border-border mt-6 border-t pt-6">
          <Link
            href={`/orders/${order.id}/case`}
            className="bg-muted text-foreground hover:bg-muted/80 flex w-full items-center justify-center rounded-md px-4 py-2.5 text-sm font-semibold transition-colors"
          >
            Report a problem
          </Link>
        </div>
      )}
    </section>
  )
}
