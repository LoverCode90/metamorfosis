import { format } from "date-fns"
import { memo } from "react"

import { PickupCarrierIcon } from "@/components/admin/shipping/pickup-carrier-icon"
import { CopyTrackingButton } from "@/components/admin/shipping/copy-tracking-button"
import { PickupStatusBadge } from "@/components/admin/shipping/pickup-status-badge"
import { Checkbox } from "@/components/ui/checkbox"
import { TableCell, TableRow } from "@/components/ui/table"
import { displayInitialsFromName } from "@/lib/admin/display-initials"
import type { PickupOrderRow } from "@/lib/admin/carrier-pickup-types"
import { formatUSD } from "@/lib/utils/format"

interface PickupTableRowProps {
  row: PickupOrderRow
  selectable?: boolean
  selected?: boolean
  onToggleSelect?: (id: string) => void
}

function formatLabelTime(iso: string | null): string {
  if (!iso) return "—"
  return format(new Date(iso), "MMM d, h:mm a")
}

export const PickupTableRow = memo(function PickupTableRow({
  row,
  selectable = false,
  selected = false,
  onToggleSelect,
}: PickupTableRowProps) {
  const initials = displayInitialsFromName(row.recipientName)

  return (
    <TableRow className="border-border/40 hover:bg-muted/30">
      {selectable && (
        <TableCell className="w-10 px-4 py-4">
          <Checkbox
            checked={selected}
            onCheckedChange={() => onToggleSelect?.(row.id)}
            aria-label={`Select ${row.recipientName}`}
          />
        </TableCell>
      )}
      <TableCell className="px-5 py-4">
        <div className="flex items-center gap-3">
          <div className="bg-primary/15 text-primary flex size-9 shrink-0 items-center justify-center rounded-full text-xs font-semibold">
            {initials}
          </div>
          <span className="text-foreground font-medium">
            {row.recipientName}
          </span>
        </div>
      </TableCell>
      <TableCell className="text-muted-foreground px-5 py-4 text-sm whitespace-nowrap">
        {formatLabelTime(row.labelPurchasedAt)}
      </TableCell>
      <TableCell className="px-5 py-4">
        <PickupCarrierIcon carrier={row.pickupCarrier} />
      </TableCell>
      <TableCell className="px-5 py-4">
        <p className="text-foreground text-sm font-medium">
          {row.serviceName ?? row.carrierDisplay}
        </p>
        {row.trackingNumber && (
          <div className="mt-0.5 flex items-center gap-1">
            <p className="text-muted-foreground font-mono text-xs">
              {row.trackingNumber}
            </p>
            <CopyTrackingButton trackingNumber={row.trackingNumber} />
          </div>
        )}
      </TableCell>
      <TableCell className="text-foreground px-5 py-4 text-sm font-semibold tabular-nums">
        {row.labelCostCents != null ? formatUSD(row.labelCostCents) : "—"}
      </TableCell>
      <TableCell className="px-5 py-4">
        <PickupStatusBadge status={row.pickupStatus} />
      </TableCell>
    </TableRow>
  )
})
