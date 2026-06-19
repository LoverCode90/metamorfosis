import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { getUserOrder } from "@/lib/orders/queries"
import { TrackingView } from "@/components/profile/tracking-view"
import type { DbOrder } from "@/lib/orders/queries"

export const metadata = { title: "Track Order — Metamorfosis Beauty" }

interface Props {
  searchParams: Promise<{ orderId?: string }>
}

export default async function TrackingPage({ searchParams }: Props) {
  const { orderId } = await searchParams

  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect("/login?next=/tracking")
  }

  let order: DbOrder | null = null
  if (orderId) {
    order = await getUserOrder(orderId, user.id)
  }

  return <TrackingView order={order} />
}
