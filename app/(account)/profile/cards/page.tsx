import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { CardsView } from "@/components/profile/cards-view"
import type { SavedCard } from "@/components/profile/cards-view"

export const metadata = { title: "Payment Methods — Metamorfosis Beauty" }

interface Props {
  searchParams: Promise<{ from?: string }>
}

export default async function CardsPage({ searchParams }: Props) {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) redirect("/login")

  const { data } = await supabase
    .from("saved_cards")
    .select(
      "id, brand, last_four, exp_month, exp_year, is_default, created_at, square_card_id",
    )
    .eq("user_id", user.id)
    .order("is_default", { ascending: false })
    .order("created_at", { ascending: false })
    .limit(3)

  const { from } = await searchParams

  return <CardsView cards={(data ?? []) as SavedCard[]} from={from ?? null} />
}
