import Link from "next/link"
import { ArrowRight, Search } from "lucide-react"
import { createAdminClient } from "@/lib/supabase/admin"
import { requireAdmin } from "@/lib/auth/helpers"
import { Input } from "@/components/ui/input"

export const metadata = {
  title: "Orders | Admin — Metamorfosis Beauty",
}

export default async function AdminOrdersPage(props: {
  searchParams: Promise<{ query?: string }>
}) {
  await requireAdmin()
  const searchParams = await props.searchParams
  const admin = createAdminClient()

  let query = admin
    .from("orders")
    .select("id, square_order_id, status, total_cents, created_at, shipping_address")
    .order("created_at", { ascending: false })
    .limit(50)

  if (searchParams.query) {
    query = query.or(`id.ilike.%${searchParams.query}%,square_order_id.ilike.%${searchParams.query}%`)
  }

  const { data: orders, error } = await query

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-foreground text-2xl font-semibold tracking-tight">
            Orders
          </h1>
          <p className="text-muted-foreground mt-1 text-sm">
            Manage customer web orders
          </p>
        </div>
      </div>

      <div className="border-border bg-card overflow-hidden rounded-2xl border">
        <div className="border-border border-b p-4">
          <form className="relative max-w-sm">
            <Search className="text-muted-foreground absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2" />
            <Input
              name="query"
              placeholder="Search by order ID..."
              defaultValue={searchParams.query}
              className="pl-9"
            />
          </form>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-border text-muted-foreground border-b font-medium">
                <th className="px-6 py-4">Order ID</th>
                <th className="px-6 py-4">Date</th>
                <th className="px-6 py-4">Customer</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4 text-right">Total</th>
                <th className="px-6 py-4" />
              </tr>
            </thead>
            <tbody className="divide-border divide-y">
              {orders?.length === 0 ? (
                <tr>
                  <td colSpan={6} className="text-muted-foreground px-6 py-8 text-center">
                    No orders found.
                  </td>
                </tr>
              ) : (
                orders?.map((order) => {
                  const addr = order.shipping_address as any
                  const customerName = addr ? `${addr.first_name} ${addr.last_name}` : "Unknown"
                  
                  return (
                    <tr key={order.id} className="hover:bg-muted/50 transition-colors">
                      <td className="px-6 py-4 font-medium">
                        {order.id.slice(0, 8)}
                      </td>
                      <td className="text-muted-foreground px-6 py-4">
                        {new Date(order.created_at).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4">{customerName}</td>
                      <td className="px-6 py-4">
                        <span className="bg-muted text-foreground inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium capitalize">
                          {order.status.replace("_", " ")}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right font-medium">
                        ${(order.total_cents / 100).toFixed(2)}
                      </td>
                      <td className="px-6 py-4 text-right">
                        <Link
                          href={`/admin/orders/${order.id}`}
                          className="text-foreground hover:bg-muted inline-flex items-center justify-center rounded-md p-2 transition-colors"
                        >
                          <ArrowRight className="h-4 w-4" />
                        </Link>
                      </td>
                    </tr>
                  )
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
