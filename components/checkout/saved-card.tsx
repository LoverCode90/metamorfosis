// components/checkout/saved-card.tsx
"use client"

import { CreditCard } from "lucide-react"

interface SavedCardProps {
  cardId: string
  buttonLabel?: string
  onUpdateCard: () => void
}

export function SavedCard({ cardId, buttonLabel = "Change card", onUpdateCard }: SavedCardProps) {
  // Extract or mock ending digits if metadata query isn't fully setup yet
  const displayDigits = cardId.length > 8 ? cardId.slice(-4) : "••••"

  return (
    <div className="border-border bg-muted/10 flex flex-col gap-4 rounded-lg border p-4 sm:flex-row sm:items-center sm:justify-between">
      <div className="flex items-center gap-3">
        <div className="bg-foreground/5 text-foreground flex h-10 w-14 items-center justify-center rounded border border-white/10 font-mono text-xs">
          <CreditCard className="mr-1 h-3.5 w-3.5" /> CARD
        </div>
        <div>
          <p className="text-foreground text-sm font-medium">Saved Card</p>
          <p className="text-muted-foreground text-xs font-mono">Ending in {displayDigits}</p>
        </div>
      </div>

      <button
        type="button"
        onClick={onUpdateCard}
        className="text-muted-foreground hover:text-foreground text-xs font-medium underline underline-offset-4 transition-colors sm:text-right"
      >
        {buttonLabel}
      </button>
    </div>
  )
}
