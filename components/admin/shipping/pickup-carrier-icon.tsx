import { Package } from "lucide-react"

import type { PickupCarrierKind } from "@/lib/admin/pickup-carrier"
import { cn } from "@/lib/utils"

interface PickupCarrierIconProps {
  carrier: PickupCarrierKind
  className?: string
}

const CARRIER_STYLES: Record<
  PickupCarrierKind,
  { label: string; bg: string; text: string }
> = {
  usps: { label: "USPS", bg: "bg-blue-600", text: "text-white" },
  dhl_express: { label: "DHL", bg: "bg-yellow-400", text: "text-black" },
}

/** Placeholder carrier badge until official SVG logos are added. */
export function PickupCarrierIcon({
  carrier,
  className,
}: PickupCarrierIconProps) {
  const style = CARRIER_STYLES[carrier]
  return (
    <div
      className={cn(
        "flex size-9 items-center justify-center rounded-full text-[10px] font-bold",
        style.bg,
        style.text,
        className,
      )}
      title={style.label}
      aria-label={style.label}
    >
      {carrier === "usps" ? (
        style.label
      ) : (
        <Package className="size-4" strokeWidth={2} />
      )}
    </div>
  )
}
