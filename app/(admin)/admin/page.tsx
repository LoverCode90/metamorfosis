import Link from "next/link"
import {
  ArrowRight,
  ClipboardList,
  ShieldCheck,
  ShoppingBag,
} from "lucide-react"
import { requireAdmin } from "@/lib/auth/helpers"
import { createAdminClient } from "@/lib/supabase/admin"

async function getStats() {
  const admin = createAdminClient()

  const [pendingResult, ordersResult, auditResult, casesResult] = await Promise.all([
    admin
      .from("profiles")
      .select("id", { count: "exact", head: true })
      .eq("verification_status", "pending_review"),
    admin
      .from("orders")
      .select("id", { count: "exact", head: true })
      .gte(
        "created_at",
        new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
      ),
    admin
      .from("audit_logs")
      .select("id, action, target_table, created_at")
      .order("created_at", { ascending: false })
      .limit(5),
    admin
      .from("cases")
      .select("id", { count: "exact", head: true })
      .eq("status", "open"),
  ])

  return {
    pendingVerifications: pendingResult.count ?? 0,
    ordersToday: ordersResult.count ?? 0,
    openCases: casesResult.count ?? 0,
    recentActivity: (auditResult.data ?? []) as {
      id: string
      action: string
      target_table: string
      created_at: string
    }[],
  }
}

export default async function AdminPage() {
  await requireAdmin()
  const stats = await getStats()

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

      {/* Stat cards */}
      <div className="grid gap-4 sm:grid-cols-3">
        <StatCard
          label="Pending verifications"
          value={stats.pendingVerifications}
          href="/admin/verifications"
          accent={stats.pendingVerifications > 0 ? "amber" : "neutral"}
        />
        <StatCard
          label="Orders today"
          value={stats.ordersToday}
          href="/admin/orders"
        />
        <StatCard label="Open cases" value={stats.openCases} href="/admin/cases" />
      </div>

      {/* Quick actions */}
      <section>
        <h2 className="text-foreground mb-3 text-sm font-semibold">
          Quick actions
        </h2>
        <div className="grid gap-3 sm:grid-cols-3">
          <QuickLink
            href="/admin/verifications"
            icon={ShieldCheck}
            label="Review verifications"
            description="Approve or reject pending license submissions"
          />
          <QuickLink
            href="/admin/orders"
            icon={ShoppingBag}
            label="Manage orders"
            description="View order details and cancel if needed"
          />
          <QuickLink
            href="/admin/cases"
            icon={ClipboardList}
            label="Handle cases"
            description="Review returns and support tickets"
          />
        </div>
      </section>

      {/* Recent activity */}
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

function formatAction(action: string): string {
  return action.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase())
}

function StatCard({
  label,
  value,
  href,
  accent = "neutral",
  disabled = false,
}: {
  label: string
  value: number
  href: string
  accent?: "amber" | "neutral"
  disabled?: boolean
}) {
  const content = (
    <div
      className={`border-border bg-background rounded-xl border p-5 transition-colors ${
        !disabled ? "hover:bg-muted/40 cursor-pointer" : "opacity-60"
      }`}
    >
      <p
        className={`text-3xl font-bold tracking-tight ${
          accent === "amber" ? "text-amber-400" : "text-foreground"
        }`}
      >
        {value}
      </p>
      <p className="text-muted-foreground mt-1 text-sm">{label}</p>
      {!disabled && (
        <p className="text-muted-foreground mt-3 flex items-center gap-1 text-xs">
          View all <ArrowRight className="h-3 w-3" />
        </p>
      )}
    </div>
  )

  if (disabled) return content
  return <Link href={href}>{content}</Link>
}

function QuickLink({
  href,
  icon: Icon,
  label,
  description,
  disabled = false,
}: {
  href: string
  icon: React.FC<{ className?: string; strokeWidth?: number }>
  label: string
  description: string
  disabled?: boolean
}) {
  const content = (
    <div
      className={`border-border bg-background flex items-start gap-4 rounded-xl border p-5 transition-colors ${
        !disabled
          ? "hover:bg-muted/40 cursor-pointer"
          : "cursor-not-allowed opacity-50"
      }`}
    >
      <span className="bg-muted mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-lg">
        <Icon className="text-foreground h-4 w-4" strokeWidth={1.75} />
      </span>
      <div>
        <p className="text-foreground text-sm font-medium">{label}</p>
        <p className="text-muted-foreground mt-0.5 text-xs leading-relaxed">
          {description}
        </p>
        {disabled && (
          <p className="text-muted-foreground mt-1 text-xs">Coming soon</p>
        )}
      </div>
    </div>
  )

  if (disabled) return content
  return <Link href={href}>{content}</Link>
}
