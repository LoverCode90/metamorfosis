import { formatUSD } from "@/lib/utils/format"
import type { DbOrderItem } from "@/lib/orders/types"

/** Line items for an order with per-line totals. */
export function OrderItemsCard({ items }: { items: DbOrderItem[] }) {
  return (
    <div className="border-border bg-card rounded-2xl border p-6">
      <h2 className="text-foreground mb-4 text-base font-semibold">Items</h2>
      <ul className="divide-border divide-y">
        {items?.map((item) => (
          <li
            key={item.id}
            className="flex items-center justify-between py-4 first:pt-0 last:pb-0"
          >
            <div>
              <p className="text-foreground text-sm font-medium">
                {item.product_variations?.name_en || "Unknown Item"}
              </p>
              <p className="text-muted-foreground text-xs">
                Qty: {item.quantity}
              </p>
            </div>
            <p className="text-foreground text-sm font-medium">
              {formatUSD(item.unit_price_cents * item.quantity)}
            </p>
          </li>
        ))}
      </ul>
    </div>
  )
}
