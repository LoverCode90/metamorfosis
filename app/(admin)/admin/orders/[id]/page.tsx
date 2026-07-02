import { redirect, notFound } from "next/navigation"
import { createAdminClient } from "@/lib/supabase/admin"
import { requireAdmin } from "@/lib/auth/helpers"
import { AdminOrderActions } from "@/components/admin/orders/admin-order-actions"
import { OrderFulfillmentCard } from "@/components/admin/orders/order-fulfillment-card"
import { OrderItemsSummaryCard } from "@/components/admin/orders/order-items-summary-card"
import {
  OrderCustomerCard,
  type AdminShippingAddress,
} from "@/components/admin/orders/order-customer-card"
import type { PackingSlipData } from "@/lib/admin/packing-slip-types"
import { mapOrderToPackingSlipData } from "@/lib/admin/map-order-to-packing-slip"
import { AdminPageHeader } from "@/components/admin/ui/admin-page-header"
import { Badge } from "@/components/ui/badge"
import { orderStatusBadge } from "@/lib/admin/status-badge"
import { isPickupShipment } from "@/lib/admin/is-pickup-shipment"

export const metadata = { title: "Order Details | Admin — Metamorfosis Beauty" }

export default async function AdminOrderDetailPage(props: {
  params: Promise<{ id: string }>
}) {
  await requireAdmin()
  const params = await props.params
  const admin = createAdminClient()

  const { data: order } = await admin
    .from("orders")
    .select(
      `*,
      order_items (
        id, variation_id, quantity, unit_price_cents, discount_cents,
        product_variations (
          name_en,
          image_url,
          product_translations ( square_product_id, name_en, image_url )
        )
      )`,
    )
    .eq("id", params.id)
    .single()

  if (!order) return notFound()

  const isPickup = isPickupShipment(order.shipping_method, order.carrier)
  if (isPickup) {
    redirect("/admin/store-pickups?tab=pending")
  }

  const addr = order.shipping_address as AdminShippingAddress | null
  const badge = orderStatusBadge(order.status)
  const canCancel = order.status === "pending"

  const packingSlip: PackingSlipData = mapOrderToPackingSlipData(order)

  return (
    <div className="space-y-6">
      <AdminPageHeader
        title={`Order #${order.id.slice(0, 8)}`}
        description={`Placed ${new Date(order.created_at).toLocaleString()}`}
        actions={
          <div className="flex items-center gap-3">
            <Badge variant={badge.variant}>{badge.label}</Badge>
            {canCancel && <AdminOrderActions orderId={order.id} />}
          </div>
        }
      />

      <div className="grid gap-6 lg:grid-cols-2">
        <div className="space-y-6">
          <OrderFulfillmentCard
            orderId={order.id}
            status={order.status}
            trackingNumber={order.tracking_number}
            trackingUrl={order.tracking_url}
            carrier={order.carrier}
            shippingMethod={order.shipping_method}
            shippoTransactionId={order.shippo_transaction_id}
            packingSlip={packingSlip}
          />
          <OrderCustomerCard address={addr} compact />
        </div>

        <OrderItemsSummaryCard
          items={order.order_items ?? []}
          subtotalCents={order.subtotal_cents}
          shippingCents={order.shipping_cents}
          taxCents={order.tax_cents}
          discountCents={order.discount_cents}
          totalCents={order.total_cents}
        />
      </div>
    </div>
  )
}
