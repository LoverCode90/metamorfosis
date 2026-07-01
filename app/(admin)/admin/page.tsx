import {
  ClipboardList,
  ShieldCheck,
  ShoppingBag,
  Store,
  Truck,
} from "lucide-react"

import { requireAdmin } from "@/lib/auth/helpers"
import { getDashboardStats } from "@/lib/admin/dashboard-stats"
import { formatUSD } from "@/lib/utils/format"
import { AdminPageHeader } from "@/components/admin/ui/admin-page-header"
import { DashboardAttentionBanner } from "@/components/admin/dashboard-attention-banner"
import { MetricCard, QuickLink } from "@/components/admin/dashboard-cards"
import { RevenueChart } from "@/components/admin/revenue-chart"
import { RecentActivity } from "@/components/admin/recent-activity"

export const metadata = { title: "Dashboard — Admin — Metamorfosis Beauty" }

export default async function AdminPage() {
  await requireAdmin()
  const stats = await getDashboardStats()

  return (
    <div className="space-y-8">
      <AdminPageHeader
        title="Dashboard"
        description="See what needs your attention and jump to the right task."
      />

      <DashboardAttentionBanner
        pendingStorePickups={stats.pendingStorePickups}
        pendingShipments={stats.pendingShipments}
        pendingVerifications={stats.pendingVerifications}
        openCases={stats.openCases}
      />

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
        <MetricCard
          label="Customer pickups waiting"
          value={stats.pendingStorePickups}
          sub="People coming to the store"
          href="/admin/store-pickups?tab=pending"
          icon={Store}
          accent={stats.pendingStorePickups > 0 ? "amber" : "neutral"}
        />
        <MetricCard
          label="Packages need labels"
          value={stats.pendingShipments}
          sub="Ready to print and ship"
          href="/admin/orders?status=pending"
          icon={Truck}
          accent={stats.pendingShipments > 0 ? "amber" : "neutral"}
        />
        <MetricCard
          label="Licenses to review"
          value={stats.pendingVerifications}
          sub="Professional accounts"
          href="/admin/verifications"
          icon={ShieldCheck}
          accent={stats.pendingVerifications > 0 ? "amber" : "neutral"}
        />
        <MetricCard
          label="Open cases"
          value={stats.openCases}
          sub="Returns and support"
          href="/admin/cases?status=open"
          icon={ClipboardList}
          accent={stats.openCases > 0 ? "amber" : "neutral"}
        />
        <MetricCard
          label="Orders today"
          value={stats.ordersToday.count}
          sub={`${formatUSD(stats.ordersToday.revenueCents)} revenue`}
          href="/admin/orders?status=all"
          icon={ShoppingBag}
        />
        <MetricCard
          label="Orders this week"
          value={stats.ordersThisWeek.count}
          sub={`${formatUSD(stats.ordersThisWeek.revenueCents)} revenue`}
          href="/admin/orders?status=all"
          icon={ShoppingBag}
        />
      </div>

      <RevenueChart data={stats.dailyRevenue} />

      <section>
        <h2 className="text-foreground mb-3 text-base font-semibold">
          Quick actions
        </h2>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          <QuickLink
            href="/admin/store-pickups?tab=pending"
            icon={Store}
            label="Customer pickups"
            description="Hand orders to people in the store"
          />
          <QuickLink
            href="/admin/orders?status=pending"
            icon={Truck}
            label="Print shipping labels"
            description="Packages going out by mail"
          />
          <QuickLink
            href="/admin/shipping/pickups"
            icon={Truck}
            label="Carrier pickup"
            description="Schedule USPS or DHL to collect packages"
          />
          <QuickLink
            href="/admin/verifications"
            icon={ShieldCheck}
            label="Review licenses"
            description="Approve stylists and students"
          />
        </div>
      </section>

      <RecentActivity entries={stats.recentActivity} />
    </div>
  )
}
