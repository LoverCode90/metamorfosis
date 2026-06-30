import { formatUSD } from "@/lib/utils/format"
import { ADMIN_SERVER_CARD_CLASS } from "@/lib/admin/card-styles"
import { cn } from "@/lib/utils"

interface OrderSummaryCardProps {
  subtotalCents: number
  shippingCents: number
  taxCents: number
  discountCents: number
  totalCents: number
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="text-muted-foreground flex justify-between">
      <span>{label}</span>
      <span>{value}</span>
    </div>
  )
}

/** Money breakdown for an order. */
export function OrderSummaryCard({
  subtotalCents,
  shippingCents,
  taxCents,
  discountCents,
  totalCents,
}: OrderSummaryCardProps) {
  return (
    <div className={cn(ADMIN_SERVER_CARD_CLASS, "p-6 text-sm")}>
      <h2 className="text-foreground mb-4 text-base font-semibold">Summary</h2>
      <div className="space-y-2">
        <Row label="Subtotal" value={formatUSD(subtotalCents)} />
        <Row label="Shipping" value={formatUSD(shippingCents)} />
        <Row label="Tax" value={formatUSD(taxCents)} />
        {discountCents > 0 && (
          <div className="text-accent-emerald flex justify-between">
            <span>Discount</span>
            <span>-{formatUSD(discountCents)}</span>
          </div>
        )}
        <div className="border-border text-foreground mt-4 flex justify-between border-t pt-4 font-medium">
          <span>Total</span>
          <span>{formatUSD(totalCents)}</span>
        </div>
      </div>
    </div>
  )
}
