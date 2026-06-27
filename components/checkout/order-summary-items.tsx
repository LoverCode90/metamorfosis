/* eslint-disable @next/next/no-img-element */
import Link from "next/link"

import { formatUSD } from "@/lib/utils/format"
import type { CartItem } from "@/lib/checkout"

interface OrderSummaryItemsProps {
  items: CartItem[]
}

/** Product row list inside the checkout order summary sidebar. */
export function OrderSummaryItems({ items }: OrderSummaryItemsProps) {
  return (
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
                className="text-foreground decoration-muted-foreground hover:decoration-foreground block truncate text-sm font-medium underline underline-offset-2"
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
  )
}
