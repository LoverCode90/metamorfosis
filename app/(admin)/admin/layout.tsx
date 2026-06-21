import Link from "next/link"
import { requireAdmin } from "@/lib/auth/helpers"
import { createAdminClient } from "@/lib/supabase/admin"
import { AdminNav } from "@/components/admin/admin-nav"

export const metadata = { title: "Admin — Metamorfosis Beauty" }

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  await requireAdmin()

  const admin = createAdminClient()
  const { count: pendingCount } = await admin
    .from("profiles")
    .select("id", { count: "exact", head: true })
    .eq("verification_status", "pending_review")

  return (
    <div className="bg-background min-h-screen">
      {/* Admin header — separate from the main site header */}
      <header className="border-border bg-background sticky top-0 z-40 border-b">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-6 px-4 py-3 sm:px-6">
          <div className="flex items-center gap-4">
            <Link
              href="/admin"
              className="text-foreground text-sm font-semibold tracking-tight"
            >
              Metamorfosis{" "}
              <span className="text-muted-foreground font-normal">Admin</span>
            </Link>
            <span className="bg-border h-4 w-px" aria-hidden="true" />
            <AdminNav pendingCount={pendingCount ?? 0} />
          </div>

          <Link
            href="/"
            className="text-muted-foreground hover:text-foreground text-xs transition-colors"
          >
            ← Back to store
          </Link>
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6">{children}</main>
    </div>
  )
}
