import { NextResponse } from "next/server"
import { requireAdmin } from "@/lib/auth/helpers"
import { runFullCatalogSync } from "@/lib/square/sync"

/**
 * Manual catalog sync trigger — admin only.
 * Use for initial data population and debugging before the webhook is wired.
 *
 * POST /api/admin/sync-catalog
 * Returns: { ok: true, stats: { items, variations, deactivated } }
 */
export async function POST() {
  await requireAdmin()

  try {
    const stats = await runFullCatalogSync()
    return NextResponse.json({ ok: true, stats })
  } catch (err) {
    console.error("[admin/sync-catalog] Sync failed:", err)
    const message = err instanceof Error ? err.message : "Unknown error"
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
