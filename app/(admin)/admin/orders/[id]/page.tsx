import Link from "next/link"
import { notFound } from "next/navigation"
import { ArrowLeft, Clock } from "lucide-react"
import { createAdminClient } from "@/lib/supabase/admin"
import { requireAdmin } from "@/lib/auth/helpers"
import { AdminOrderActions } from "@/components/admin/orders/admin-order-actions"
import type { DbOrderItem } from "@/lib/orders/types"

// TODO: `shipping_address` is stored with two inconsistent shapes — camelCase in
// DbOrder (fullName, streetLine1, city, state, zip) vs snake_case Square-style here
// (first_name, address_line_1, locality, administrative_district_level_1, postal_code).
// Unify on a single canonical address shape and migrate existing rows.
type AdminShippingAddress = {
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

export const metadata = {
  title: "Order Details | Admin — Metamorfosis Beauty",
}

export default async function AdminOrderDetailPage(props: {
  params: Promise<{ id: string }>
}) {
  await requireAdmin()
  const params = await props.params
  const admin = createAdminClient()

  const { data: order } = await admin
    .from("orders")
    .select(
      `
      *,
      order_items (
        id, variation_id, quantity, unit_price_cents, discount_cents,
        product_variations (
          name_en,
          product_translations ( square_product_id )
        )
      )
    `,
    )
    .eq("id", params.id)
    .single()

  if (!order) return notFound()

  const addr = order.shipping_address as AdminShippingAddress | null
  const canCancel = ["pending", "confirmed", "processing"].includes(
    order.status,
  )

  return (
    <div className="space-y-6">
      <Link
        href="/admin/orders"
        className="text-muted-foreground hover:text-foreground inline-flex items-center gap-2 text-sm font-medium transition-colors"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to Orders
      </Link>

      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h1 className="text-foreground text-2xl font-semibold tracking-tight">
            Order #{order.id.slice(0, 8)}
          </h1>
          <p className="text-muted-foreground mt-1 flex items-center gap-1.5 text-sm">
            <Clock className="h-3.5 w-3.5" />
            Placed {new Date(order.created_at).toLocaleString()}
          </p>
        </div>
        <div className="flex items-center gap-3">
          <span className="bg-muted text-foreground inline-flex items-center rounded-full px-3 py-1 text-sm font-medium capitalize">
            {order.status.replace("_", " ")}
          </span>
          {canCancel && <AdminOrderActions orderId={order.id} />}
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        <div className="space-y-6 md:col-span-2">
          <div className="border-border bg-card rounded-2xl border p-6">
            <h2 className="text-foreground mb-4 text-base font-semibold">
              Items
            </h2>
            <ul className="divide-border divide-y">
              {order.order_items?.map((item: DbOrderItem) => (
                <li
                  key={item.id}
                  className="flex items-center justify-between py-4 first:pt-0 last:pb-0"
                >
                  <div>
                    <p className="text-foreground text-sm font-medium">
                      {item.product_variations?.name_en || "Unknown Item"}
                    </p>
                    <p className="text-muted-foreground text-xs">
                      Qty: {item.quantity}
                    </p>
                  </div>
                  <p className="text-foreground text-sm font-medium">
                    $
                    {((item.unit_price_cents * item.quantity) / 100).toFixed(2)}
                  </p>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="space-y-6">
          <div className="border-border bg-card rounded-2xl border p-6 text-sm">
            <h2 className="text-foreground mb-4 text-base font-semibold">
              Summary
            </h2>
            <div className="space-y-2">
              <div className="text-muted-foreground flex justify-between">
                <span>Subtotal</span>
                <span>${(order.subtotal_cents / 100).toFixed(2)}</span>
              </div>
              <div className="text-muted-foreground flex justify-between">
                <span>Shipping</span>
                <span>${(order.shipping_cents / 100).toFixed(2)}</span>
              </div>
              <div className="text-muted-foreground flex justify-between">
                <span>Tax</span>
                <span>${(order.tax_cents / 100).toFixed(2)}</span>
              </div>
              {order.discount_cents > 0 && (
                <div className="flex justify-between text-green-600">
                  <span>Discount</span>
                  <span>-${(order.discount_cents / 100).toFixed(2)}</span>
                </div>
              )}
              <div className="border-border text-foreground mt-4 flex justify-between border-t pt-4 font-medium">
                <span>Total</span>
                <span>${(order.total_cents / 100).toFixed(2)}</span>
              </div>
            </div>
          </div>

          <div className="border-border bg-card rounded-2xl border p-6 text-sm">
            <h2 className="text-foreground mb-4 text-base font-semibold">
              Customer Details
            </h2>
            {addr ? (
              <div className="text-muted-foreground space-y-1">
                <p className="text-foreground font-medium">
                  {addr.first_name} {addr.last_name}
                </p>
                <p>{addr.email}</p>
                <p>{addr.phone}</p>
                <div className="mt-4">
                  <p>{addr.address_line_1}</p>
                  {addr.address_line_2 && <p>{addr.address_line_2}</p>}
                  <p>
                    {addr.locality}, {addr.administrative_district_level_1}{" "}
                    {addr.postal_code}
                  </p>
                  <p>{addr.country}</p>
                </div>
              </div>
            ) : (
              <p className="text-muted-foreground">
                No customer details available.
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
