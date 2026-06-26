import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { AddCardView } from "@/components/profile/add-card-view"

export const metadata = { title: "Add Card — Metamorfosis Beauty" }

export default async function AddCardPage() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) redirect("/login")

  return <AddCardView />
}
