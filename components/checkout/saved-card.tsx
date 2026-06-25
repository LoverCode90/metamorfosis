import { CreditCard, TriangleAlert, CheckCircle2 } from "lucide-react"
import { Badge } from "@/components/ui/badge"

interface SavedCardProps {
  onUpdateCard: () => void
  isValid?: boolean
  buttonLabel?: string
}

// Masked pre-saved card shown in checkout or demo variants.
export function SavedCard({
  onUpdateCard,
  isValid = false,
  buttonLabel = "Update card to continue",
}: SavedCardProps) {
  return (
    <div className="border-border bg-muted/30 rounded-lg border p-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <span className="bg-foreground/5 text-foreground flex h-9 w-9 items-center justify-center rounded-md">
            <CreditCard className="h-4 w-4" strokeWidth={1.75} />
          </span>
          <div>
            <p className="text-foreground text-sm font-medium tabular-nums">
              {"•••• •••• •••• 4321"}
            </p>
            <p className="text-muted-foreground text-xs">
              {isValid ? "Visa · Card on File" : "Visa · Expires 04/24"}
            </p>
          </div>
        </div>

        {isValid ? (
          <Badge className="gap-1 border-emerald-300 bg-emerald-100 text-emerald-800 hover:bg-emerald-100">
            <CheckCircle2 className="h-3 w-3" />
            Active
          </Badge>
        ) : (
          <Badge className="gap-1 border-amber-300 bg-amber-100 text-amber-800 hover:bg-amber-100">
            <TriangleAlert className="h-3 w-3" />
            Expired
          </Badge>
        )}
      </div>

      <button
        type="button"
        onClick={onUpdateCard}
        className="border-border text-foreground hover:bg-muted/60 mt-4 w-full rounded-md border border-dashed py-2.5 text-xs font-medium transition-colors"
      >
        {buttonLabel}
      </button>
    </div>
  )
}
