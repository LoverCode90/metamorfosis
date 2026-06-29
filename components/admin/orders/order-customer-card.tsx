// TODO: `shipping_address` is stored with two inconsistent shapes — camelCase in
// DbOrder (fullName, streetLine1, city, state, zip) vs snake_case Square-style
// here (first_name, address_line_1, locality, administrative_district_level_1,
// postal_code). Unify on a single canonical address shape and migrate rows.
export type AdminShippingAddress = {
  first_name?: string
  last_name?: string
  email?: string
  phone?: string
  address_line_1?: string
  address_line_2?: string
  locality?: string
  administrative_district_level_1?: string
  postal_code?: string
  country?: string
}

/** Customer name, contact, and shipping address for an order. */
export function OrderCustomerCard({
  address,
}: {
  address: AdminShippingAddress | null
}) {
  return (
    <div className="border-border bg-card rounded-2xl border p-6 text-sm">
      <h2 className="text-foreground mb-4 text-base font-semibold">
        Customer Details
      </h2>
      {address ? (
        <div className="text-muted-foreground space-y-1">
          <p className="text-foreground font-medium">
            {address.first_name} {address.last_name}
          </p>
          <p>{address.email}</p>
          <p>{address.phone}</p>
          <div className="mt-4">
            <p>{address.address_line_1}</p>
            {address.address_line_2 && <p>{address.address_line_2}</p>}
            <p>
              {address.locality}, {address.administrative_district_level_1}{" "}
              {address.postal_code}
            </p>
            <p>{address.country}</p>
          </div>
        </div>
      ) : (
        <p className="text-muted-foreground">No customer details available.</p>
      )}
    </div>
  )
}
