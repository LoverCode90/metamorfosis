"use client"

import { ChevronRight } from "lucide-react"

import { Badge } from "@/components/ui/badge"
import {
  statusBadgeVariant,
  statusLabel,
  type VerificationRow,
} from "@/lib/admin/verifications"
import { formatDate } from "@/lib/utils/format"
import { cn } from "@/lib/utils"

interface VerificationListItemProps {
  item: VerificationRow
  selected: boolean
  onSelect: () => void
}

/** Selectable verification summary row with a status badge. */
export function VerificationListItem({
  item,
  selected,
  onSelect,
}: VerificationListItemProps) {
  const itemClass = cn(
    "border-border w-full rounded-xl border p-4 text-left transition-colors",
    selected
      ? "bg-foreground/5 border-foreground/20"
      : "bg-background hover:bg-muted/50",
  )

  return (
    <button type="button" onClick={onSelect} className={itemClass}>
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0">
          <p className="text-foreground truncate text-sm font-medium">
            {item.full_name}
          </p>
          <p className="text-muted-foreground truncate text-xs">{item.email}</p>
        </div>
        <div className="flex shrink-0 items-center gap-2">
          <Badge variant={statusBadgeVariant(item.verification_status)}>
            {statusLabel(item.verification_status)}
          </Badge>
          <ChevronRight
            className="text-muted-foreground h-4 w-4"
            strokeWidth={1.75}
          />
        </div>
      </div>
      <p className="text-muted-foreground mt-2 text-xs">
        Updated {formatDate(item.updated_at)}
      </p>
    </button>
  )
}
