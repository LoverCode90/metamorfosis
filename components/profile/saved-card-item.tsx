"use client"

import { memo } from "react"
import { CreditCard, Trash2 } from "lucide-react"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import type { SavedCard } from "@/lib/profile/cards-api"

function isExpired(expMonth: number, expYear: number): boolean {
  const now = new Date()
  const year = now.getFullYear()
  const month = now.getMonth() + 1
  return expYear < year || (expYear === year && expMonth < month)
}

function formatExpiry(expMonth: number, expYear: number): string {
  return `${String(expMonth).padStart(2, "0")}/${expYear}`
}

interface SavedCardItemProps {
  card: SavedCard
  isDeleting: boolean
  onDelete: (id: string) => void
}

export const SavedCardItem = memo(function SavedCardItem({
  card,
  isDeleting,
  onDelete,
}: SavedCardItemProps) {
  const expired = isExpired(card.exp_month, card.exp_year)

  return (
    <div className="border-border bg-card flex items-center gap-4 rounded-2xl border p-4">
      <span className="bg-muted flex h-11 w-11 shrink-0 items-center justify-center rounded-xl">
        <CreditCard className="text-foreground h-5 w-5" strokeWidth={1.75} />
      </span>

      <span className="min-w-0 flex-1">
        <span className="text-foreground flex items-center gap-2 text-sm font-semibold">
          {card.brand ?? "Card"} ending in {card.last_four}
          {expired && <Badge variant="destructive">Expired</Badge>}
        </span>
        <span className="text-muted-foreground block text-xs">
          Expires {formatExpiry(card.exp_month, card.exp_year)}
        </span>
      </span>

      <Button
        variant="ghost"
        size="icon-sm"
        onClick={() => onDelete(card.id)}
        disabled={isDeleting}
        aria-label={`Delete ${card.brand ?? "card"} ending in ${card.last_four}`}
        className="text-muted-foreground hover:text-destructive shrink-0"
      >
        <Trash2 className="h-4 w-4" strokeWidth={1.75} />
      </Button>
    </div>
  )
})
