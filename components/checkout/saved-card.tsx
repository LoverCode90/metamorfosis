"use client"

import { CreditCard } from "lucide-react"

interface SavedCardProps {
  last_four: string
  brand?: string | null
  exp_month: number
  exp_year: number
  buttonLabel?: string
  onUpdateCard: () => void
}

export function SavedCard({
  last_four,
  brand,
  exp_month,
  exp_year,
  buttonLabel = "Change card",
  onUpdateCard,
}: SavedCardProps) {
  const now = new Date()
  const expired =
    exp_year < now.getFullYear() ||
    (exp_year === now.getFullYear() && exp_month < now.getMonth() + 1)

  return (
    <div className="border-border bg-muted/10 flex flex-col gap-4 rounded-lg border p-4 sm:flex-row sm:items-center sm:justify-between">
      <div className="flex items-center gap-3">
        <div className="bg-foreground/5 text-foreground flex h-10 w-14 items-center justify-center rounded border border-white/10 font-mono text-xs">
          <CreditCard className="mr-1 h-3.5 w-3.5" /> CARD
        </div>
        <div>
          <p className="text-foreground flex items-center gap-2 text-sm font-medium">
            {brand ? `${brand} · ` : ""}Card ending in {last_four}
            {expired && (
              <span className="rounded-full bg-orange-500/15 px-2 py-0.5 text-xs font-medium text-orange-500">
                Expired
              </span>
            )}
          </p>
          <p className="text-muted-foreground font-mono text-xs">
            Expires {String(exp_month).padStart(2, "0")}/{exp_year}
          </p>
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
