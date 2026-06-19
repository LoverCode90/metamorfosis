import { Lock, MapPin } from "lucide-react"

export function ShippingLocked() {
  return (
    <div className="border-border bg-muted/30 flex items-center gap-3 rounded-lg border px-4 py-3.5">
      <span className="bg-foreground text-background flex h-9 w-9 shrink-0 items-center justify-center rounded-md">
        <MapPin className="h-4 w-4" strokeWidth={2} />
      </span>
      <div className="min-w-0 flex-1">
        <p className="text-muted-foreground text-[11px] font-semibold tracking-wider uppercase">
          Shipping destination locked
        </p>
        <p className="text-foreground truncate text-sm font-medium">
          United States (US)
        </p>
      </div>
      <Lock className="text-muted-foreground h-4 w-4 shrink-0" />
    </div>
  )
}
