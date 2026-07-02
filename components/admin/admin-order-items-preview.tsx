import {
  itemsSummary,
  type AdminOrderItemSummary,
} from "@/lib/admin/order-list"
import { itemLabel } from "@/lib/orders/item-label"
import { AdminProductThumb } from "@/components/admin/admin-product-thumb"

/** First-item thumbnail plus one-line items summary for order list rows. */
export function AdminOrderItemsPreview({
  items,
}: {
  items: AdminOrderItemSummary[]
}) {
  const first = items[0]
  const label = itemsSummary(items)
  const alt = first
    ? itemLabel(
        first.product_variations?.product_translations?.name_en,
        first.product_variations?.name_en,
      )
    : "Order item"

  return (
    <div className="flex min-w-0 items-center gap-3">
      {first && (
        <AdminProductThumb variation={first.product_variations} alt={alt} />
      )}
      <span className="text-muted-foreground break-words">{label}</span>
    </div>
  )
}
