import { NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"
import { createAdminClient } from "@/lib/supabase/admin"

const PAGE_SIZE = 10

type StatusFilter = "pending_review" | "approved" | "rejected" | "all"

/**
 * GET /api/admin/verifications
 *
 * Query params:
 *   status  — "pending_review" | "approved" | "rejected" | "all" (default: "pending_review")
 *   cursor  — ISO timestamp of the last item for pagination
 *
 * Returns:
 *   { items: VerificationRow[], nextCursor: string | null }
 */
export async function GET(request: NextRequest): Promise<NextResponse> {
  // ── Admin auth ────────────────────────────────────────────────────────────
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single()

  if (profile?.role !== "admin") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 })
  }

  // ── Query params ──────────────────────────────────────────────────────────
  const { searchParams } = new URL(request.url)
  const status = (searchParams.get("status") ??
    "pending_review") as StatusFilter
  const cursor = searchParams.get("cursor")

  const admin = createAdminClient()

  let query = admin
    .from("profiles")
    .select(
      "id, full_name, email, role, verification_status, rejection_reason, license_number, document_url, expiration_date, business_name, created_at, updated_at",
    )
    .not("verification_status", "eq", "not_applicable")
    .order("updated_at", { ascending: false })
    .limit(PAGE_SIZE + 1)

  if (status !== "all") {
    query = query.eq("verification_status", status)
  }

  if (cursor) {
    query = query.lt("updated_at", cursor)
  }

  const { data, error } = await query

  if (error) {
    console.error("[admin/verifications] Query failed:", error)
    return NextResponse.json({ error: "Database error" }, { status: 500 })
  }

  const hasMore = (data?.length ?? 0) > PAGE_SIZE
  const items = hasMore ? data!.slice(0, PAGE_SIZE) : (data ?? [])
  const nextCursor =
    hasMore && items.length > 0
      ? (items[items.length - 1] as { updated_at: string }).updated_at
      : null

  return NextResponse.json({ items, nextCursor })
}
