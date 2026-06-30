"use client"

import { memo } from "react"
import { ChevronRight } from "lucide-react"

import { Badge } from "@/components/ui/badge"
import { displayInitialsFromName } from "@/lib/admin/display-initials"
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

/** Selectable verification row with primary highlight when active. */
export const VerificationListItem = memo(function VerificationListItem({
  item,
  selected,
  onSelect,
}: VerificationListItemProps) {
  return (
    <button
      type="button"
      onClick={onSelect}
      className={cn(
        "border-border/50 w-full rounded-xl border p-4 text-left transition-all",
        selected
          ? "border-primary/40 bg-primary/10 ring-primary/25 shadow-[0_0_24px_-8px_var(--primary)] ring-1"
          : "bg-card/60 hover:border-border hover:bg-muted/40",
      )}
    >
      <div className="flex items-start gap-3">
        <div
          className={cn(
            "flex size-10 shrink-0 items-center justify-center rounded-full text-xs font-semibold ring-1",
            selected
              ? "bg-primary/20 text-primary ring-primary/30"
              : "bg-muted text-muted-foreground ring-border/60",
          )}
        >
          {displayInitialsFromName(item.full_name)}
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex items-start justify-between gap-2">
            <div className="min-w-0">
              <p className="text-foreground text-sm font-medium break-words">
                {item.full_name}
              </p>
              <p className="text-muted-foreground text-xs break-all">
                {item.email}
              </p>
            </div>
            <div className="flex shrink-0 items-center gap-1.5">
              <Badge variant={statusBadgeVariant(item.verification_status)}>
                {statusLabel(item.verification_status)}
              </Badge>
              <ChevronRight
                className="text-muted-foreground h-4 w-4 lg:hidden"
                strokeWidth={1.75}
              />
            </div>
          </div>
          <p className="text-muted-foreground mt-2 text-xs">
            Updated {formatDate(item.updated_at)}
          </p>
        </div>
      </div>
    </button>
  )
})

VerificationListItem.displayName = "VerificationListItem"
