import { createAdminClient } from "@/lib/supabase/admin"
import { requireAdmin } from "@/lib/auth/helpers"
import { AdminStatusFilter } from "@/components/admin/admin-status-filter"
import { AdminPagination } from "@/components/admin/admin-pagination"
import { OrderTableRow } from "@/components/admin/orders/order-table-row"
import { OrderMobileCard } from "@/components/admin/orders/order-mobile-card"
import {
  ORDERS_PER_PAGE,
  type AdminOrderListItem,
} from "@/lib/admin/order-list"

export const metadata = { title: "Orders | Admin — Metamorfosis Beauty" }

const ORDER_STATUS_FILTERS = [
  "pending",
  "confirmed",
  "processing",
  "shipped",
  "delivered",
  "canceled",
  "refunded",
]

export default async function AdminOrdersPage(props: {
  searchParams: Promise<{ status?: string; page?: string }>
}) {
  await requireAdmin()
  const { status, page: pageParam } = await props.searchParams
  const page = Math.max(1, Number(pageParam) || 1)
  const from = (page - 1) * ORDERS_PER_PAGE
  const admin = createAdminClient()

  let query = admin
    .from("orders")
    .select(
      `id, square_order_id, status, total_cents, created_at, guest_email,
       tracking_number, shipping_address,
       profiles ( first_name, last_name, full_name ),
       order_items (
         quantity,
         product_variations (
           name_en,
           product_translations ( name_en )
         )
       )`,
      { count: "exact" },
    )
    .order("created_at", { ascending: false })
    .range(from, from + ORDERS_PER_PAGE - 1)

  if (status) query = query.eq("status", status)

  const { data, count } = await query
  const orders = (data as unknown as AdminOrderListItem[] | null) ?? []
  const totalPages = Math.ceil((count ?? 0) / ORDERS_PER_PAGE)

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-foreground text-2xl font-semibold tracking-tight">
          Orders
        </h1>
        <p className="text-muted-foreground mt-1 text-sm">
          Manage customer web orders
        </p>
      </div>

      <AdminStatusFilter
        basePath="/admin/orders"
        active={status}
        options={ORDER_STATUS_FILTERS}
      />

      {orders.length === 0 ? (
        <div className="border-border bg-card text-muted-foreground rounded-2xl border px-5 py-12 text-center text-sm">
          No orders found.
        </div>
      ) : (
        <>
          {/* Desktop table */}
          <div className="border-border bg-card hidden overflow-hidden rounded-2xl border md:block">
            <table className="w-full text-left text-sm">
              <thead className="bg-muted/50 text-muted-foreground text-xs uppercase">
                <tr>
                  <th className="px-5 py-3 font-medium">Customer</th>
                  <th className="px-5 py-3 font-medium">Date</th>
                  <th className="px-5 py-3 font-medium">Items</th>
                  <th className="px-5 py-3 font-medium">Status</th>
                  <th className="px-5 py-3 font-medium">Tracking</th>
                  <th className="px-5 py-3 text-right font-medium">Total</th>
                  <th className="px-5 py-3" />
                </tr>
              </thead>
              <tbody className="divide-border divide-y">
                {orders.map((order) => (
                  <OrderTableRow key={order.id} order={order} />
                ))}
              </tbody>
            </table>
          </div>

          {/* Mobile cards */}
          <div className="space-y-3 md:hidden">
            {orders.map((order) => (
              <OrderMobileCard key={order.id} order={order} />
            ))}
          </div>
        </>
      )}

      <AdminPagination
        basePath="/admin/orders"
        page={page}
        totalPages={totalPages}
        params={{ status }}
      />
    </div>
  )
}
