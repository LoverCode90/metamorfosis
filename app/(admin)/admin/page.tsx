import { ClipboardList, ShieldCheck, ShoppingBag, Truck } from "lucide-react"

import { requireAdmin } from "@/lib/auth/helpers"
import { getDashboardStats } from "@/lib/admin/dashboard-stats"
import { formatUSD } from "@/lib/utils/format"
import { MetricCard, QuickLink } from "@/components/admin/dashboard-cards"

export const metadata = { title: "Dashboard — Admin — Metamorfosis Beauty" }

function formatAction(action: string): string {
  return action.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase())
}

export default async function AdminPage() {
  await requireAdmin()
  const stats = await getDashboardStats()

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-foreground text-2xl font-semibold tracking-tight">
          Dashboard
        </h1>
        <p className="text-muted-foreground mt-1 text-sm">
          Metamorfosis Beauty Supply — Admin
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <MetricCard
          label="Orders today"
          value={stats.ordersToday.count}
          sub={`${formatUSD(stats.ordersToday.revenueCents)} revenue`}
          href="/admin/orders"
        />
        <MetricCard
          label="Orders this week"
          value={stats.ordersThisWeek.count}
          sub={`${formatUSD(stats.ordersThisWeek.revenueCents)} revenue`}
          href="/admin/orders"
        />
        <MetricCard
          label="Pending shipments"
          value={stats.pendingShipments}
          sub="Paid orders without tracking"
          href="/admin/orders?status=pending"
          accent={stats.pendingShipments > 0 ? "amber" : "neutral"}
        />
        <MetricCard
          label="Open cases"
          value={stats.openCases}
          href="/admin/cases?status=open"
          accent={stats.openCases > 0 ? "amber" : "neutral"}
        />
        <MetricCard
          label="Pending verifications"
          value={stats.pendingVerifications}
          href="/admin/verifications"
          accent={stats.pendingVerifications > 0 ? "amber" : "neutral"}
        />
      </div>

      <section>
        <h2 className="text-foreground mb-3 text-sm font-semibold">
          Quick actions
        </h2>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          <QuickLink
            href="/admin/orders"
            icon={ShoppingBag}
            label="Manage orders"
            description="View details, update status, ship"
          />
          <QuickLink
            href="/admin/orders?status=pending"
            icon={Truck}
            label="Ship orders"
            description="Generate labels for pending shipments"
          />
          <QuickLink
            href="/admin/cases"
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

      {stats.recentActivity.length > 0 && (
        <section>
          <h2 className="text-foreground mb-3 text-sm font-semibold">
            Recent activity
          </h2>
          <ul className="border-border divide-border divide-y rounded-xl border">
            {stats.recentActivity.map((entry) => (
              <li
                key={entry.id}
                className="flex items-center justify-between gap-4 px-5 py-3"
              >
                <div>
                  <p className="text-foreground text-sm font-medium">
                    {formatAction(entry.action)}
                  </p>
                  <p className="text-muted-foreground text-xs">
                    {entry.target_table}
                  </p>
                </div>
                <time
                  dateTime={entry.created_at}
                  className="text-muted-foreground shrink-0 text-xs"
                >
                  {new Date(entry.created_at).toLocaleString("en-US", {
                    month: "short",
                    day: "numeric",
                    hour: "numeric",
                    minute: "2-digit",
                  })}
                </time>
              </li>
            ))}
          </ul>
        </section>
      )}
    </div>
  )
}
