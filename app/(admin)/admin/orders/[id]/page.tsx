import { createAdminClient } from "@/lib/supabase/admin"
import { notFound } from "next/navigation"
import { requireAdmin } from "@/lib/auth/helpers"
import { AdminOrderActions } from "@/components/admin/orders/admin-order-actions"
import { OrderItemsCard } from "@/components/admin/orders/order-items-card"
import { OrderFulfillmentCard } from "@/components/admin/orders/order-fulfillment-card"
import { OrderSummaryCard } from "@/components/admin/orders/order-summary-card"
import {
  OrderCustomerCard,
  type AdminShippingAddress,
} from "@/components/admin/orders/order-customer-card"
import type { PackingSlipData } from "@/components/admin/orders/packing-slip-print"
import {
  AdminBentoGrid,
  AdminPageHeader,
} from "@/components/admin/ui/admin-page-header"
import { Badge } from "@/components/ui/badge"
import { orderStatusBadge } from "@/lib/admin/status-badge"

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
          product_translations ( square_product_id, name_en )
        )
      )`,
    )
    .eq("id", params.id)
    .single()

  if (!order) return notFound()

  const addr = order.shipping_address as AdminShippingAddress | null
  const badge = orderStatusBadge(order.status)
  const canCancel = ["pending", "confirmed"].includes(order.status)

  const isPickup =
    order.shipping_method === "pickup" || order.carrier === "pickup"

  const packingSlip: PackingSlipData = {
    orderId: order.id,
    createdAt: order.created_at,
    isPickup,
    address: (order.shipping_address as PackingSlipData["address"]) ?? null,
    items: (order.order_items ?? []).map(
      (item: {
        id: string
        quantity: number
        unit_price_cents: number
        product_variations: {
          name_en: string
          product_translations: { name_en: string } | null
        } | null
      }) => ({
        id: item.id,
        quantity: item.quantity,
        unitPriceCents: item.unit_price_cents,
        productName:
          item.product_variations?.product_translations?.name_en ??
          "Unknown Product",
        variationName: item.product_variations?.name_en ?? "",
      }),
    ),
    subtotalCents: order.subtotal_cents,
    discountCents: order.discount_cents,
    surchargeCents: order.surcharge_cents ?? 0,
    taxCents: order.tax_cents,
    shippingCents: order.shipping_cents,
    totalCents: order.total_cents,
  }

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

      <AdminBentoGrid>
        <div className="md:col-span-2">
          <OrderItemsCard items={order.order_items ?? []} />
        </div>

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

        <OrderSummaryCard
          subtotalCents={order.subtotal_cents}
          shippingCents={order.shipping_cents}
          taxCents={order.tax_cents}
          discountCents={order.discount_cents}
          totalCents={order.total_cents}
        />

        <div className="md:col-span-2">
          <OrderCustomerCard address={addr} />
        </div>
      </AdminBentoGrid>
    </div>
  )
}
