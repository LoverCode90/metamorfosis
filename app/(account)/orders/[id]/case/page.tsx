import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { getUserOrder } from "@/lib/orders/queries"
import { CaseForm } from "@/components/profile/case-form"
import { CaseTrackingView } from "@/components/profile/case-tracking-view"

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

  // Check if a case already exists
  const { data: caseData } = await supabase
    .from("cases")
    .select(
      `
      *,
      case_messages (
        id, case_id, sender_id, message, created_at
      )
    `,
    )
    .eq("order_id", params.id)
    .maybeSingle()

  if (caseData) {
    // Sort messages ascending
    caseData.case_messages =
      caseData.case_messages?.sort(
        (a: { created_at: string }, b: { created_at: string }) =>
          new Date(a.created_at).getTime() - new Date(b.created_at).getTime(),
      ) || []
    return <CaseTrackingView caseData={caseData} />
  }

  // If no case exists, allow creating one
  return <CaseForm order={order} />
}
