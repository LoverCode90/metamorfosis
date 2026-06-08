import { Lock, MapPin } from "lucide-react"
import { SHIPPING_DESTINATION } from "@/lib/checkout"

export function ShippingLocked() {
  return (
    <div className="flex items-center gap-3 rounded-lg border border-border bg-muted/30 px-4 py-3.5">
      <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-md bg-foreground text-background">
        <MapPin className="h-4 w-4" strokeWidth={2} />
      </span>
      <div className="min-w-0 flex-1">
        <p className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
          Shipping destination locked
        </p>
        <p className="truncate text-sm font-medium text-foreground">
          {SHIPPING_DESTINATION}
        </p>
      </div>
      <Lock className="h-4 w-4 shrink-0 text-muted-foreground" />
    </div>
  )
}
