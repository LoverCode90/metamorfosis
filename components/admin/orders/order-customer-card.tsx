import {
  normalizeShippingAddress,
  type RawShippingAddress,
} from "@/lib/admin/normalize-shipping-address"
import { ADMIN_SERVER_CARD_CLASS } from "@/lib/admin/card-styles"
import { cn } from "@/lib/utils"

export type AdminShippingAddress = RawShippingAddress

/** Customer name, contact, and shipping address for an order. */
export function OrderCustomerCard({
  address,
  compact = false,
  embedded = false,
}: {
  address: AdminShippingAddress | null
  compact?: boolean
  embedded?: boolean
}) {
  const normalized = normalizeShippingAddress(address)

  return (
    <div
      className={cn(
        embedded
          ? compact
            ? "text-sm"
            : "text-sm"
          : cn(ADMIN_SERVER_CARD_CLASS, "p-6 text-sm"),
        !embedded && compact && "p-4",
        embedded && "border-border rounded-xl border p-4",
      )}
    >
      <h2
        className={cn(
          "text-foreground font-semibold",
          compact ? "mb-2 text-sm" : "mb-4 text-base",
        )}
      >
        Customer Details
      </h2>
      {normalized ? (
        <div className="text-muted-foreground space-y-1">
          {normalized.fullName && (
            <p className="text-foreground font-medium">{normalized.fullName}</p>
          )}
          {normalized.email && <p>{normalized.email}</p>}
          {normalized.phone && <p>{normalized.phone}</p>}
          {normalized.streetLine1 && (
            <div className={compact ? "mt-2" : "mt-4"}>
              <p>{normalized.streetLine1}</p>
              {normalized.streetLine2 && <p>{normalized.streetLine2}</p>}
              {(normalized.city || normalized.state || normalized.zip) && (
                <p>
                  {[normalized.city, normalized.state]
                    .filter(Boolean)
                    .join(", ")}
                  {normalized.zip ? ` ${normalized.zip}` : ""}
                </p>
              )}
              {normalized.country && <p>{normalized.country}</p>}
            </div>
          )}
        </div>
      ) : (
        <p className="text-muted-foreground">No customer details available.</p>
      )}
    </div>
  )
}
