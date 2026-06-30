import { notFound } from "next/navigation"

import { PackingSlipLayout } from "@/components/admin/orders/packing-slip-layout"
import { createAdminClient } from "@/lib/supabase/admin"
import { requireAdmin } from "@/lib/auth/helpers"
import { mapOrderToPackingSlipData } from "@/lib/admin/map-order-to-packing-slip"
import { PrintTrigger } from "./print-trigger"

export const metadata = { title: "Packing Slip | Metamorfosis" }

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

  const slipData = mapOrderToPackingSlipData(order)

  return (
    <div className="mx-auto min-h-screen max-w-sm bg-white p-4 font-sans text-black print:m-0 print:p-0">
      <PrintTrigger />
      <PackingSlipLayout slipData={slipData} />
    </div>
  )
}
