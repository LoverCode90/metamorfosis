import type {
  StorePickupPage,
  StorePickupTab,
} from "@/lib/admin/store-pickup-types"

export async function fetchStorePickupsPage(
  tab: StorePickupTab,
  cursor?: string,
): Promise<StorePickupPage> {
  const params = new URLSearchParams({ tab })
  if (cursor) params.set("cursor", cursor)

  const res = await fetch(`/api/admin/store-pickups?${params.toString()}`)
  if (!res.ok) {
    throw new Error("Failed to load store pickups")
  }

  return (await res.json()) as StorePickupPage
}
