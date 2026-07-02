import { redirect } from "next/navigation"
import { createAdminClient } from "@/lib/supabase/admin"
import { requireAdmin } from "@/lib/auth/helpers"
import { AdminStatusFilter } from "@/components/admin/admin-status-filter"
import { OrdersHelpCard } from "@/components/admin/help/orders-help-card"
import { orderStatusLabel } from "@/lib/admin/admin-status-labels"
import { AdminPagination } from "@/components/admin/admin-pagination"
import { OrderTableRow } from "@/components/admin/orders/order-table-row"
import { OrderMobileCard } from "@/components/admin/orders/order-mobile-card"
import { AdminPageHeader } from "@/components/admin/ui/admin-page-header"
import {
  ADMIN_TABLE_HEAD_CLASS,
  ADMIN_TABLE_SHELL_CLASS,
} from "@/lib/admin/card-styles"
import {
  Table,
  TableBody,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  ORDERS_PER_PAGE,
  type AdminOrderListItem,
} from "@/lib/admin/order-list"

export const metadata = { title: "Orders | Admin — Metamorfosis Beauty" }

const ORDER_STATUS_FILTERS = [
  "pending",
  "confirmed",
  "shipped",
  "delivered",
  "canceled",
] as const

export default async function AdminOrdersPage(props: {
  searchParams: Promise<{ status?: string; page?: string }>
}) {
  await requireAdmin()
  const { status, page: pageParam } = await props.searchParams

  if (!status) {
    redirect("/admin/orders?status=pending")
  }

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
           image_url,
           product_translations ( name_en, image_url )
         )
       )`,
      { count: "exact" },
    )
    .order("created_at", { ascending: false })
    .range(from, from + ORDERS_PER_PAGE - 1)

  query = query.neq("carrier", "pickup")

  if (status !== "all") query = query.eq("status", status)

  const { data, count } = await query
  const orders = (data as unknown as AdminOrderListItem[] | null) ?? []
  const totalPages = Math.ceil((count ?? 0) / ORDERS_PER_PAGE)

  return (
    <div className="space-y-6">
      <AdminPageHeader
        title="Ship orders"
        description="Print labels and ship packages by mail. For customers picking up in the store, use Customer pickups."
      />

      <OrdersHelpCard />

      <AdminStatusFilter
        basePath="/admin/orders"
        active={status}
        options={ORDER_STATUS_FILTERS}
        labelFor={orderStatusLabel}
      />

      {orders.length === 0 ? (
        <div
          className={`${ADMIN_TABLE_SHELL_CLASS} text-muted-foreground px-5 py-16 text-center text-base leading-relaxed`}
        >
          No orders in this list.
          {status === "pending" && (
            <>
              {" "}
              New mail orders will appear here when they need a shipping label.
            </>
          )}
        </div>
      ) : (
        <>
          <div className={`${ADMIN_TABLE_SHELL_CLASS} hidden md:block`}>
            <Table>
              <TableHeader>
                <TableRow className="border-border/50 hover:bg-transparent">
                  <TableHead className={`${ADMIN_TABLE_HEAD_CLASS} h-11 px-5`}>
                    Customer
                  </TableHead>
                  <TableHead className={`${ADMIN_TABLE_HEAD_CLASS} h-11 px-5`}>
                    Date
                  </TableHead>
                  <TableHead className={`${ADMIN_TABLE_HEAD_CLASS} h-11 px-5`}>
                    Items
                  </TableHead>
                  <TableHead className={`${ADMIN_TABLE_HEAD_CLASS} h-11 px-5`}>
                    Status
                  </TableHead>
                  <TableHead className={`${ADMIN_TABLE_HEAD_CLASS} h-11 px-5`}>
                    Tracking
                  </TableHead>
                  <TableHead
                    className={`${ADMIN_TABLE_HEAD_CLASS} h-11 px-5 text-right`}
                  >
                    Total
                  </TableHead>
                  <TableHead
                    className={`${ADMIN_TABLE_HEAD_CLASS} h-11 w-12 px-5`}
                  />
                </TableRow>
              </TableHeader>
              <TableBody>
                {orders.map((order) => (
                  <OrderTableRow key={order.id} order={order} />
                ))}
              </TableBody>
            </Table>
          </div>

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
