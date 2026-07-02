import { redirect } from "next/navigation"

import { StorePickupHelpCard } from "@/components/admin/store-pickups/store-pickup-help-card"
import { StorePickupList } from "@/components/admin/store-pickups/store-pickup-list"
import { StorePickupTabs } from "@/components/admin/store-pickups/store-pickup-tabs"
import { AdminPageHeader } from "@/components/admin/ui/admin-page-header"
import { countPendingStorePickups } from "@/lib/admin/count-pending-store-pickups"
import {
  fetchCanceledStorePickupsPage,
  fetchHistoryStorePickupsPage,
  fetchPendingStorePickupsPage,
} from "@/lib/admin/fetch-store-pickups"
import type { StorePickupTab } from "@/lib/admin/store-pickup-types"
import { requireAdmin } from "@/lib/auth/helpers"

export const metadata = {
  title: "Store Pickups | Admin — Metamorfosis Beauty",
}

const VALID_TABS: StorePickupTab[] = ["pending", "canceled", "history"]

export default async function AdminStorePickupsPage(props: {
  searchParams: Promise<{ tab?: string }>
}) {
  await requireAdmin()
  const { tab } = await props.searchParams

  if (!tab || !VALID_TABS.includes(tab as StorePickupTab)) {
    redirect("/admin/store-pickups?tab=pending")
  }

  const activeTab = tab as StorePickupTab

  const [pendingCount, page] = await Promise.all([
    countPendingStorePickups(),
    activeTab === "pending"
      ? fetchPendingStorePickupsPage()
      : activeTab === "canceled"
        ? fetchCanceledStorePickupsPage()
        : fetchHistoryStorePickupsPage(),
  ])

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <AdminPageHeader
          title="Customer pickups"
          description="When a customer arrives, match their email ticket number and hand off the order."
        />
        <StorePickupTabs activeTab={activeTab} pendingCount={pendingCount} />
      </div>

      <StorePickupHelpCard />

      <StorePickupList
        key={activeTab}
        tab={activeTab}
        initialOrders={page.items}
        initialNextCursor={page.nextCursor}
      />
    </div>
  )
}
