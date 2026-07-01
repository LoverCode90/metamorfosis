import { AdminHelpCard } from "@/components/admin/ui/admin-help-card"

export function CarrierPickupHelpCard() {
  return (
    <AdminHelpCard
      title="How to schedule mail carrier pickup"
      steps={[
        <>
          First print shipping labels from <strong>Orders</strong> — packages
          must say <strong>Label printed</strong> before they appear here.
        </>,
        <>
          Check the boxes for the packages going out, then tap{" "}
          <strong>Schedule carrier pickup</strong>.
        </>,
        <>
          Pick a date and time window. USPS and DHL will come to the store to
          collect the packages.
        </>,
      ]}
      note="This is for mail carriers picking up packages — not customers picking up orders in the store. For in-store customers, use Customer pickups."
    />
  )
}
