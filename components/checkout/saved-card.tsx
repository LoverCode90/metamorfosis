import { CreditCard, TriangleAlert } from "lucide-react"
import { Badge } from "@/components/ui/badge"

// Masked pre-saved card shown in the "expired" demo variant.
export function SavedCard() {
  return (
    <div className="rounded-lg border border-border bg-muted/30 p-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <span className="flex h-9 w-9 items-center justify-center rounded-md bg-foreground/5 text-foreground">
            <CreditCard className="h-4 w-4" strokeWidth={1.75} />
          </span>
          <div>
            <p className="text-sm font-medium text-foreground tabular-nums">
              {"•••• •••• •••• 4321"}
            </p>
            <p className="text-xs text-muted-foreground">Visa · Expires 04/24</p>
          </div>
        </div>

        <Badge className="gap-1 border-amber-300 bg-amber-100 text-amber-800 hover:bg-amber-100">
          <TriangleAlert className="h-3 w-3" />
          Expired
        </Badge>
      </div>

      <button
        type="button"
        className="mt-4 w-full rounded-md border border-dashed border-border py-2.5 text-xs font-medium text-foreground transition-colors hover:bg-muted/60"
      >
        Update card to continue
      </button>
    </div>
  )
}
