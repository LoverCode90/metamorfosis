import { ClipboardList, ShieldCheck, ShoppingBag, Truck } from "lucide-react"

import { requireAdmin } from "@/lib/auth/helpers"
import { getDashboardStats } from "@/lib/admin/dashboard-stats"
import { formatUSD } from "@/lib/utils/format"
import { AdminPageHeader } from "@/components/admin/ui/admin-page-header"
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
        description="Metamorfosis Beauty Supply — operations overview."
      />

      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <MetricCard
          label="Orders today"
          value={stats.ordersToday.count}
          sub={`${formatUSD(stats.ordersToday.revenueCents)} revenue`}
          href="/admin/orders?status=pending"
          icon={ShoppingBag}
        />
        <MetricCard
          label="Orders this week"
          value={stats.ordersThisWeek.count}
          sub={`${formatUSD(stats.ordersThisWeek.revenueCents)} revenue`}
          href="/admin/orders?status=pending"
          icon={ShoppingBag}
        />
        <MetricCard
          label="Pending shipments"
          value={stats.pendingShipments}
          sub="Awaiting tracking"
          href="/admin/orders?status=pending"
          icon={Truck}
          accent={stats.pendingShipments > 0 ? "amber" : "neutral"}
        />
        <MetricCard
          label="Open cases"
          value={stats.openCases}
          sub="Need review"
          href="/admin/cases?status=open"
          icon={ClipboardList}
          accent={stats.openCases > 0 ? "amber" : "neutral"}
        />
      </div>

      <RevenueChart data={stats.dailyRevenue} />

      <section>
        <h2 className="text-foreground mb-3 text-sm font-semibold">
          Quick actions
        </h2>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          <QuickLink
            href="/admin/orders?status=pending"
            icon={ShoppingBag}
            label="Manage orders"
            description="View pending orders and print labels"
          />
          <QuickLink
            href="/admin/orders?status=pending"
            icon={Truck}
            label="Ship orders"
            description="Generate labels for pending shipments"
          />
          <QuickLink
            href="/admin/cases?status=open"
            icon={ClipboardList}
            label="Handle cases"
            description="Review returns and support tickets"
          />
          <QuickLink
            href="/admin/verifications"
            icon={ShieldCheck}
            label="Review verifications"
            description="Approve or reject license submissions"
          />
        </div>
      </section>

      <RecentActivity entries={stats.recentActivity} />
    </div>
  )
}
