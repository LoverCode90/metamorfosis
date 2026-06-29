import "server-only"

import { createAdminClient } from "@/lib/supabase/admin"

export interface PeriodStats {
  count: number
  revenueCents: number
}

export interface DashboardStats {
  ordersToday: PeriodStats
  ordersThisWeek: PeriodStats
  pendingShipments: number
  openCases: number
  pendingVerifications: number
  recentActivity: {
    id: string
    action: string
    target_table: string
    created_at: string
  }[]
}

// Revenue ignores orders that were never fulfilled.
const REVENUE_STATUSES = [
  "pending",
  "confirmed",
  "processing",
  "shipped",
  "delivered",
]

async function periodStats(
  admin: ReturnType<typeof createAdminClient>,
  sinceIso: string,
): Promise<PeriodStats> {
  const { data } = await admin
    .from("orders")
    .select("total_cents")
    .gte("created_at", sinceIso)
    .in("status", REVENUE_STATUSES)

  const rows = data ?? []
  const revenueCents = rows.reduce(
    (sum, row) => sum + (row.total_cents ?? 0),
    0,
  )
  return { count: rows.length, revenueCents }
}

/** Aggregates the figures shown on the admin dashboard cards. */
export async function getDashboardStats(): Promise<DashboardStats> {
  const admin = createAdminClient()
  const now = Date.now()
  const dayAgo = new Date(now - 24 * 60 * 60 * 1000).toISOString()
  const weekAgo = new Date(now - 7 * 24 * 60 * 60 * 1000).toISOString()

  const [
    ordersToday,
    ordersThisWeek,
    shipmentsResult,
    casesResult,
    verificationsResult,
    auditResult,
  ] = await Promise.all([
    periodStats(admin, dayAgo),
    periodStats(admin, weekAgo),
    admin
      .from("orders")
      .select("id", { count: "exact", head: true })
      .is("tracking_number", null)
      .in("status", ["pending", "confirmed", "processing"]),
    admin
      .from("cases")
      .select("id", { count: "exact", head: true })
      .eq("status", "open"),
    admin
      .from("profiles")
      .select("id", { count: "exact", head: true })
      .eq("verification_status", "pending_review"),
    admin
      .from("audit_logs")
      .select("id, action, target_table, created_at")
      .order("created_at", { ascending: false })
      .limit(5),
  ])

  return {
    ordersToday,
    ordersThisWeek,
    pendingShipments: shipmentsResult.count ?? 0,
    openCases: casesResult.count ?? 0,
    pendingVerifications: verificationsResult.count ?? 0,
    recentActivity: auditResult.data ?? [],
  }
}
