import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { AddCardView } from "@/components/profile/add-card-view"

export const metadata = { title: "Add Card — Metamorfosis Beauty" }

interface Props {
  searchParams: Promise<{ from?: string }>
}

export default async function AddCardPage({ searchParams }: Props) {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) redirect("/login")

  const { from } = await searchParams

  return <AddCardView from={from ?? null} />
}
