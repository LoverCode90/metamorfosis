import { itemLabel } from "@/lib/orders/item-label"
import type { DbOrderItem } from "@/lib/orders/types"
import { ADMIN_SERVER_CARD_CLASS } from "@/lib/admin/card-styles"
import { formatUSD } from "@/lib/utils/format"
import { cn } from "@/lib/utils"

/** Line items for an order with per-line totals. */
export function OrderItemsCard({ items }: { items: DbOrderItem[] }) {
  return (
    <div className={cn(ADMIN_SERVER_CARD_CLASS, "p-6")}>
      <h2 className="text-foreground mb-4 text-base font-semibold">Items</h2>
      <ul className="divide-border divide-y">
        {items?.map((item) => (
          <li
            key={item.id}
            className="flex items-center justify-between py-4 first:pt-0 last:pb-0"
          >
            <div className="min-w-0">
              <p className="text-foreground truncate text-sm font-medium">
                {itemLabel(
                  item.product_variations?.product_translations?.name_en,
                  item.product_variations?.name_en,
                )}
              </p>
              <p className="text-muted-foreground text-xs">
                Qty {item.quantity} · {formatUSD(item.unit_price_cents)} each
              </p>
            </div>
            <p className="text-foreground shrink-0 text-sm font-medium">
              {formatUSD(item.unit_price_cents * item.quantity)}
            </p>
          </li>
        ))}
      </ul>
    </div>
  )
}
