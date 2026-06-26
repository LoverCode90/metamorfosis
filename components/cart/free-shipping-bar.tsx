import { PartyPopper, Truck } from "lucide-react"

import { FREE_SHIPPING_THRESHOLD_CENTS } from "@/lib/constants"
import { formatUSD } from "@/lib/utils/format"
import { cn } from "@/lib/utils"

/**
 * Progress toward the free-shipping threshold. A single track whose fill width
 * tracks the subtotal and whose color steps red → amber → green at 40% / 80%.
 */
export function FreeShippingBar({ subtotalCents }: { subtotalCents: number }) {
  const pct = Math.min(
    100,
    (subtotalCents / FREE_SHIPPING_THRESHOLD_CENTS) * 100,
  )
  const unlocked = subtotalCents >= FREE_SHIPPING_THRESHOLD_CENTS
  const remaining = Math.max(0, FREE_SHIPPING_THRESHOLD_CENTS - subtotalCents)

  const fillColor =
    pct >= 80 ? "bg-emerald-500" : pct >= 40 ? "bg-amber-500" : "bg-red-500"
  const fillClass = cn(
    "h-full rounded-full transition-[width,background-color] duration-500 ease-out",
    fillColor,
  )

  return (
    <div className="mt-4 sm:mt-5">
      <p className="text-foreground flex items-center gap-1.5 text-sm font-medium">
        {unlocked ? (
          <>
            <PartyPopper
              className="h-4 w-4 text-emerald-500"
              strokeWidth={1.75}
            />
            You&apos;ve unlocked free shipping!
          </>
        ) : (
          <>
            <Truck
              className="text-muted-foreground h-4 w-4"
              strokeWidth={1.75}
            />
            Free shipping on orders over{" "}
            {formatUSD(FREE_SHIPPING_THRESHOLD_CENTS)}
          </>
        )}
      </p>
      {!unlocked && (
        <p className="text-muted-foreground mt-0.5 text-xs">
          Add {formatUSD(remaining)} more to qualify.
        </p>
      )}
      <div
        className="bg-muted mt-2 h-2 w-full overflow-hidden rounded-full"
        role="progressbar"
        aria-valuenow={Math.round(pct)}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-label="Progress toward free shipping"
      >
        <div className={fillClass} style={{ width: `${pct}%` }} />
      </div>
    </div>
  )
}
