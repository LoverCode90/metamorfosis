import { AddressesView } from "@/components/profile/addresses-view"

export const metadata = { title: "Shipping Info — Metamorfosis Beauty" }

interface Props {
  searchParams: Promise<{ from?: string }>
}

export default async function AddressesPage({ searchParams }: Props) {
  const { from } = await searchParams
  return <AddressesView from={from ?? null} />
}
