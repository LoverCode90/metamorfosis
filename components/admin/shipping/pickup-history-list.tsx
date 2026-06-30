"use client"

import { memo } from "react"

import type { CarrierPickupRecord } from "@/lib/admin/carrier-pickup-types"
import { CARRIER_PICKUP_SLOTS } from "@/lib/admin/pickup-slots"
import { formatPacificDateTime } from "@/lib/admin/pacific-datetime"
import { formatRelativeTime } from "@/lib/admin/format-relative-time"

interface PickupHistoryListProps {
  records: CarrierPickupRecord[]
}

export function PickupHistoryList({ records }: PickupHistoryListProps) {
  if (records.length === 0) {
    return (
      <p className="text-muted-foreground text-sm">No pickups scheduled yet.</p>
    )
  }

  return (
    <ul className="divide-border/60 border-border/60 divide-y rounded-xl border">
      {records.map((record) => (
        <PickupHistoryRow key={record.id} record={record} />
      ))}
    </ul>
  )
}

const PickupHistoryRow = memo(function PickupHistoryRow({
  record,
}: {
  record: CarrierPickupRecord
}) {
  const slot = CARRIER_PICKUP_SLOTS[record.slotKey]
  const confirmed =
    record.confirmedStartTime && record.confirmedEndTime
      ? `${formatPacificDateTime(record.confirmedStartTime)} – ${formatPacificDateTime(record.confirmedEndTime)}`
      : null

  return (
    <li className="space-y-1 px-4 py-3 text-sm">
      <div className="flex items-center justify-between gap-3">
        <p className="text-foreground font-medium">
          {record.pickupDate} · {slot.label}
        </p>
        <span className="text-muted-foreground text-xs">
          {formatRelativeTime(record.createdAt)}
        </span>
      </div>
      <p className="text-muted-foreground text-xs">
        {record.orderCount} package{record.orderCount === 1 ? "" : "s"} · Status{" "}
        {record.status}
        {record.confirmationCode ? ` · Code ${record.confirmationCode}` : ""}
      </p>
      {confirmed && (
        <p className="text-muted-foreground text-xs">Confirmed: {confirmed}</p>
      )}
    </li>
  )
})
