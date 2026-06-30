import { notFound } from "next/navigation"
import { Package, Store } from "lucide-react"
import { createAdminClient } from "@/lib/supabase/admin"
import { requireAdmin } from "@/lib/auth/helpers"
import { formatUSD } from "@/lib/utils/format"
import { PrintTrigger } from "./print-trigger"

export const metadata = { title: "Packing Slip | Metamorfosis" }

interface OrderItem {
  id: string
  quantity: number
  unit_price_cents: number
  product_variations: {
    name_en: string
    product_translations: { name_en: string } | null
  } | null
}

export default async function PackingSlipPage(props: {
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
        id, quantity, unit_price_cents,
        product_variations (
          name_en,
          product_translations ( name_en )
        )
      )`,
    )
    .eq("id", params.id)
    .single()

  if (!order) return notFound()

  // Define proper types for the fetched relation
  const items = order.order_items as unknown as OrderItem[]
  const address = order.shipping_address as Record<string, string> | null

  const isPickup =
    order.shipping_method === "pickup" || order.carrier === "pickup"

  return (
    <div className="mx-auto min-h-screen max-w-sm bg-white p-4 font-sans text-black print:m-0 print:p-0">
      <PrintTrigger />

      <div className="flex flex-col gap-6">
        <div className="flex flex-col items-center justify-center border-b border-black pb-4 text-center">
          <Store className="mb-2 h-8 w-8" strokeWidth={2} />
          <h1 className="text-xl font-bold tracking-tight uppercase">
            Metamorfosis
          </h1>
          <p className="text-sm font-medium">
            Order #{order.id.slice(0, 8).toUpperCase()}
          </p>
          <p className="mt-1 text-xs text-gray-500">
            {new Date(order.created_at).toLocaleString()}
          </p>
        </div>

        {isPickup && (
          <div className="rounded-md border-4 border-black py-2 text-center">
            <span className="text-xl font-black tracking-widest uppercase">
              Store Pickup
            </span>
          </div>
        )}

        <div className="flex flex-col gap-1">
          <h2 className="text-xs font-bold tracking-wider text-gray-500 uppercase">
            Customer Info
          </h2>
          <p className="text-lg font-bold">{address?.fullName || "Guest"}</p>
          {address?.phone && (
            <p className="text-sm font-medium">{address.phone}</p>
          )}
          {address?.email && (
            <p className="text-sm font-medium">{address.email}</p>
          )}
          {address?.streetLine1 && (
            <div className="mt-1 text-sm font-medium">
              <p>{address.streetLine1}</p>
              {address.streetLine2 && <p>{address.streetLine2}</p>}
              <p>
                {address.city}, {address.state} {address.zip}
              </p>
            </div>
          )}
        </div>

        <div className="flex flex-col gap-3">
          <h2 className="flex items-center gap-2 text-xs font-bold tracking-wider text-gray-500 uppercase">
            <Package className="h-4 w-4" strokeWidth={2} />
            Items ({items?.length ?? 0})
          </h2>
          <div className="flex flex-col gap-3">
            {items?.map((item) => {
              const productName =
                item.product_variations?.product_translations?.name_en ||
                "Unknown Product"
              const variationName = item.product_variations?.name_en || ""

              return (
                <div
                  key={item.id}
                  className="flex items-start justify-between gap-4 border-t border-dashed border-gray-300 pt-3"
                >
                  <div className="flex flex-col">
                    <span className="text-base leading-tight font-bold">
                      {productName}
                    </span>
                    <span className="mt-0.5 text-sm font-medium text-gray-600">
                      {variationName}
                    </span>
                    <span className="mt-1 text-xs font-medium">
                      {formatUSD(item.unit_price_cents)} x {item.quantity}
                    </span>
                  </div>
                  <div className="flex shrink-0 flex-col items-end gap-1">
                    <div className="flex shrink-0 items-center justify-center rounded bg-black px-2.5 py-1 text-white">
                      <span className="text-sm font-bold">
                        x{item.quantity}
                      </span>
                    </div>
                    <span className="text-sm font-bold">
                      {formatUSD(item.unit_price_cents * item.quantity)}
                    </span>
                  </div>
                </div>
              )
            })}
          </div>
        </div>

        <div className="border-t border-black pt-4">
          <div className="flex flex-col gap-1.5 text-sm">
            <div className="flex justify-between text-gray-600">
              <span>Subtotal</span>
              <span>{formatUSD(order.subtotal_cents)}</span>
            </div>
            {order.discount_cents > 0 && (
              <div className="flex justify-between text-gray-600">
                <span>Discount</span>
                <span>-{formatUSD(order.discount_cents)}</span>
              </div>
            )}
            {order.surcharge_cents > 0 && (
              <div className="flex justify-between text-gray-600">
                <span>Fee</span>
                <span>{formatUSD(order.surcharge_cents)}</span>
              </div>
            )}
            <div className="flex justify-between text-gray-600">
              <span>Taxes</span>
              <span>{formatUSD(order.tax_cents)}</span>
            </div>
            {order.shipping_cents > 0 && (
              <div className="flex justify-between text-gray-600">
                <span>Shipping</span>
                <span>{formatUSD(order.shipping_cents)}</span>
              </div>
            )}
            <div className="mt-2 flex justify-between border-t border-dashed border-gray-300 pt-2 text-base font-bold">
              <span>Total</span>
              <span>{formatUSD(order.total_cents)}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
