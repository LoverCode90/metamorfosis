import {
  normalizeShippingAddress,
  type RawShippingAddress,
} from "@/lib/admin/normalize-shipping-address"

export type AdminShippingAddress = RawShippingAddress

/** Customer name, contact, and shipping address for an order. */
export function OrderCustomerCard({
  address,
}: {
  address: AdminShippingAddress | null
}) {
  const normalized = normalizeShippingAddress(address)

  return (
    <div className="border-border bg-card rounded-2xl border p-6 text-sm">
      <h2 className="text-foreground mb-4 text-base font-semibold">
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
            <div className="mt-4">
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
