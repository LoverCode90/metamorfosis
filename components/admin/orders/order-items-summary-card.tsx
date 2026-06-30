import { itemLabel } from "@/lib/orders/item-label"
import type { DbOrderItem } from "@/lib/orders/types"
import { ADMIN_SERVER_CARD_CLASS } from "@/lib/admin/card-styles"
import { formatUSD } from "@/lib/utils/format"
import { cn } from "@/lib/utils"

interface OrderItemsSummaryCardProps {
  items: DbOrderItem[]
  subtotalCents: number
  shippingCents: number
  taxCents: number
  discountCents: number
  totalCents: number
  embedded?: boolean
}

function SummaryRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="text-muted-foreground flex justify-between text-sm">
      <span>{label}</span>
      <span>{value}</span>
    </div>
  )
}

/** Line items plus order totals in a single card. */
export function OrderItemsSummaryCard({
  items,
  subtotalCents,
  shippingCents,
  taxCents,
  discountCents,
  totalCents,
  embedded = false,
}: OrderItemsSummaryCardProps) {
  return (
    <div
      className={cn(
        embedded
          ? "flex h-full flex-col"
          : cn(ADMIN_SERVER_CARD_CLASS, "flex h-full flex-col p-6"),
        embedded && "p-1",
      )}
    >
      <h2 className="text-foreground mb-4 text-base font-semibold">Items</h2>
      <ul className="divide-border flex-1 divide-y">
        {items?.map((item) => (
          <li
            key={item.id}
            className="flex items-start justify-between gap-3 py-4 first:pt-0"
          >
            <div className="min-w-0">
              <p className="text-foreground text-sm font-medium break-words">
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

      <div className="border-border mt-4 space-y-2 border-t pt-4">
        <SummaryRow label="Subtotal" value={formatUSD(subtotalCents)} />
        <SummaryRow label="Shipping" value={formatUSD(shippingCents)} />
        <SummaryRow label="Tax" value={formatUSD(taxCents)} />
        {discountCents > 0 && (
          <div className="text-accent-emerald flex justify-between text-sm">
            <span>Discount</span>
            <span>-{formatUSD(discountCents)}</span>
          </div>
        )}
        <div className="text-foreground flex justify-between pt-2 text-sm font-semibold">
          <span>Total</span>
          <span>{formatUSD(totalCents)}</span>
        </div>
      </div>
    </div>
  )
}
