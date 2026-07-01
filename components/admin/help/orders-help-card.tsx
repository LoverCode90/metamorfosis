import { AdminHelpCard } from "@/components/admin/ui/admin-help-card"

export function OrdersHelpCard() {
  return (
    <AdminHelpCard
      title="How to ship a package"
      steps={[
        <>
          Open an order that says <strong>Needs label</strong>.
        </>,
        <>
          Tap <strong>Print shipping label</strong>, then print the label and
          stick it on the box.
        </>,
        <>
          Go to <strong>Carrier pickup</strong> in the menu to schedule USPS or
          DHL to pick up labeled packages from the store.
        </>,
      ]}
      note="Store pickup orders (customers coming to the store) are in Customer pickups — not on this page."
    />
  )
}
