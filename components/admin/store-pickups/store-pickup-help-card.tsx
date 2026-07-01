import { PICKUP_ADDRESS } from "@/lib/checkout/pickup"

import { AdminHelpCard } from "@/components/admin/ui/admin-help-card"

export function StorePickupHelpCard() {
  return (
    <AdminHelpCard
      title="How to hand off a store pickup"
      steps={[
        <>
          Ask the customer for their <strong>pickup ticket number</strong> from
          their confirmation email.
        </>,
        <>
          Find the <strong>same ticket number</strong> on this page and check
          the customer name matches.
        </>,
        <>
          Hand them their bag, then tap{" "}
          <strong>Customer picked up order</strong>.
        </>,
      ]}
      note={`Pickup location: ${PICKUP_ADDRESS}. Customers have 5 days to pick up. After that, the order is canceled and their money is refunded automatically.`}
    />
  )
}
