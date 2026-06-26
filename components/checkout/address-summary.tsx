import { Check } from "lucide-react"

import { formatUSD, shippingFor } from "@/lib/checkout"
import type { SavedAddress } from "@/lib/checkout"

/** Read-only saved shipping address card with an estimated shipping line. */
export function AddressSummary({ address }: { address: SavedAddress }) {
  const shipping = shippingFor(address.country)

  return (
    <div className="border-foreground bg-foreground/[0.03] mt-4 flex items-start gap-3 rounded-lg border p-4">
      <span className="bg-foreground mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full">
        <Check className="text-background h-3 w-3" strokeWidth={3} />
      </span>
      <div className="text-sm leading-relaxed">
        <p className="text-foreground font-medium">{address.fullName}</p>
        <p className="text-muted-foreground">{address.line1}</p>
        <p className="text-muted-foreground">
          {address.city}
          {address.region ? `, ${address.region}` : ""} {address.postalCode}
        </p>
        <p className="text-muted-foreground">{address.country}</p>
        <p className="text-foreground mt-2 text-xs font-medium">
          Estimated shipping to {address.country}:{" "}
          {shipping === 0 ? "Free" : formatUSD(shipping)}
        </p>
      </div>
    </div>
  )
}
