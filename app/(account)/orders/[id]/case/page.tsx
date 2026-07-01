import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { getUserOrder } from "@/lib/orders/queries"
import { CaseForm } from "@/components/profile/case-form"
import { CaseTrackingView } from "@/components/profile/case-tracking-view"
import type { DbCase } from "@/lib/cases/types"

export const metadata = { title: "Report a Problem — Metamorfosis Beauty" }

export default async function OrderCasePage(props: {
  params: Promise<{ id: string }>
}) {
  const params = await props.params
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect(`/login?next=/orders/${params.id}/case`)
  }

  const order = await getUserOrder(params.id, user.id)

  if (!order) {
    redirect("/orders")
  }

  const { data: caseData } = await supabase
    .from("cases")
    .select("*")
    .eq("order_id", params.id)
    .maybeSingle()

  if (caseData) {
    return <CaseTrackingView caseData={caseData as DbCase} />
  }

  return <CaseForm order={order} />
}
