import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { getUserOrdersPage } from "@/lib/orders/queries"
import { OrdersList, OrdersBackButton } from "@/components/profile/orders-list"

export const metadata = { title: "My Orders — Metamorfosis Beauty" }

const INITIAL_PAGE_SIZE = 10

export default async function OrdersPage() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect("/login?next=/orders")
  }

  const { orders, total } = await getUserOrdersPage(
    user.id,
    INITIAL_PAGE_SIZE,
    0,
  )
  const hasMore = total > orders.length

  // Re-seed the client list whenever the server set changes (e.g. after a
  // cancel + router.refresh()). useOrdersPagination seeds its state from
  // initialOrders only at mount, so without a changing key the refreshed
  // props would be ignored and the canceled card would linger.
  const ordersKey = `${total}:${orders.map((order) => order.id).join("-")}`

  return (
    <div className="mx-auto max-w-3xl px-4 py-8 sm:px-6 lg:py-12">
      <OrdersBackButton />
      <div className="mt-4 flex flex-col gap-1">
        <p className="text-muted-foreground text-xs font-medium tracking-[0.3em] uppercase">
          My Account
        </p>
        <h1 className="text-foreground text-2xl font-semibold tracking-tight sm:text-3xl">
          My Orders
        </h1>
      </div>
      <div className="mt-8">
        <OrdersList key={ordersKey} initialOrders={orders} hasMore={hasMore} />
      </div>
    </div>
  )
}
