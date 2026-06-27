import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { getUserOrders } from "@/lib/orders/queries"
import { OrdersList, OrdersBackButton } from "@/components/profile/orders-list"

export const metadata = { title: "My Orders — Metamorfosis Beauty" }

export default async function OrdersPage() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect("/login?next=/orders")
  }

  const orders = await getUserOrders(user.id)

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
        <OrdersList orders={orders} />
      </div>
    </div>
  )
}
