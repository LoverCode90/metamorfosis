import { redirect } from "next/navigation"

import { StorePickupHelpCard } from "@/components/admin/store-pickups/store-pickup-help-card"
import { StorePickupRow } from "@/components/admin/store-pickups/store-pickup-row"
import { StorePickupTabs } from "@/components/admin/store-pickups/store-pickup-tabs"
import { AdminPageHeader } from "@/components/admin/ui/admin-page-header"
import { AdminSurfaceCard } from "@/components/admin/ui/admin-surface-card"
import {
  fetchExpiredStorePickups,
  fetchFulfilledStorePickups,
  fetchPendingStorePickups,
} from "@/lib/admin/fetch-store-pickups"
import type { StorePickupTab } from "@/lib/admin/store-pickup-types"
import { requireAdmin } from "@/lib/auth/helpers"

export const metadata = {
  title: "Store Pickups | Admin — Metamorfosis Beauty",
}

export default async function AdminStorePickupsPage(props: {
  searchParams: Promise<{ tab?: string }>
}) {
  await requireAdmin()
  const { tab } = await props.searchParams
  const activeTab: StorePickupTab = tab === "history" ? "history" : "pending"

  if (!tab) {
    redirect("/admin/store-pickups?tab=pending")
  }

  const [pending, fulfilled, expired] = await Promise.all([
    fetchPendingStorePickups(),
    fetchFulfilledStorePickups(10),
    fetchExpiredStorePickups(10),
  ])

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <AdminPageHeader
          title="Customer pickups"
          description="When a customer arrives, match their email ticket number and hand off the order."
        />
        <StorePickupTabs activeTab={activeTab} pendingCount={pending.length} />
      </div>

      <StorePickupHelpCard />

      {activeTab === "pending" ? (
        pending.length === 0 ? (
          <AdminSurfaceCard title="No customers waiting">
            <p className="text-muted-foreground text-base leading-relaxed">
              When someone orders for store pickup, their order will show up
              here with a ticket number.
            </p>
          </AdminSurfaceCard>
        ) : (
          <div className="grid gap-5">
            {pending.map((order) => (
              <StorePickupRow key={order.id} order={order} mode="pending" />
            ))}
          </div>
        )
      ) : (
        <div className="space-y-8">
          <section className="space-y-4">
            <h2 className="text-foreground text-sm font-semibold tracking-wide uppercase">
              Recently fulfilled
            </h2>
            {fulfilled.length === 0 ? (
              <p className="text-muted-foreground text-sm">
                No completed store pickups yet.
              </p>
            ) : (
              <div className="grid gap-5">
                {fulfilled.map((order) => (
                  <StorePickupRow key={order.id} order={order} mode="history" />
                ))}
              </div>
            )}
          </section>

          <section className="space-y-4">
            <h2 className="text-foreground text-sm font-semibold tracking-wide uppercase">
              Expired without pickup
            </h2>
            {expired.length === 0 ? (
              <p className="text-muted-foreground text-sm">
                No expired pickup orders in recent history.
              </p>
            ) : (
              <div className="grid gap-5">
                {expired.map((order) => (
                  <StorePickupRow key={order.id} order={order} mode="history" />
                ))}
              </div>
            )}
          </section>
        </div>
      )}
    </div>
  )
}
