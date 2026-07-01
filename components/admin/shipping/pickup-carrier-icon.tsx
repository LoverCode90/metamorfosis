import Image from "next/image"

import type { PickupCarrierKind } from "@/lib/admin/pickup-carrier"
import dhlExpressLogo from "@/assets/admin/dhl-express.svg"
import uspsLogo from "@/assets/admin/usps.svg"
import { cn } from "@/lib/utils"

interface PickupCarrierIconProps {
  carrier: PickupCarrierKind
  className?: string
}

const CARRIER_LOGOS: Record<
  PickupCarrierKind,
  { src: typeof uspsLogo; alt: string }
> = {
  usps: { src: uspsLogo, alt: "USPS" },
  dhl_express: { src: dhlExpressLogo, alt: "DHL Express" },
}

export function PickupCarrierIcon({
  carrier,
  className,
}: PickupCarrierIconProps) {
  const logo = CARRIER_LOGOS[carrier]

  return (
    <div
      className={cn(
        "bg-muted/40 flex size-9 shrink-0 items-center justify-center overflow-hidden rounded-full p-1.5",
        className,
      )}
      title={logo.alt}
    >
      <Image
        src={logo.src}
        alt={logo.alt}
        width={28}
        height={28}
        className="size-full object-contain"
      />
    </div>
  )
}
