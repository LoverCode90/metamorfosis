import Link from "next/link"
import { requireAdmin } from "@/lib/auth/helpers"
import { createAdminClient } from "@/lib/supabase/admin"
import { AdminNav } from "@/components/admin/admin-nav"
import { AdminShell } from "@/components/admin/admin-shell"
import { SignOutButton } from "@/components/auth/sign-out-button"

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
    <AdminShell>
      {/* Admin header — separate from the main site header */}
      <header className="border-border bg-background sticky top-0 z-40 border-b">
        <div className="mx-auto flex max-w-7xl items-center gap-2 px-3 py-3 sm:gap-4 sm:px-6">
          <Link
            href="/admin"
            className="text-foreground shrink-0 text-sm font-semibold tracking-tight"
          >
            <span className="hidden sm:inline">Metamorfosis </span>
            <span className="sm:hidden">MB </span>
            <span className="text-muted-foreground font-normal">Admin</span>
          </Link>

          <span
            className="bg-border hidden h-4 w-px shrink-0 sm:block"
            aria-hidden="true"
          />

          {/* Nav grows and scrolls only as a last resort; labels collapse to
              icons below lg so it never forces page-level horizontal scroll. */}
          <div className="min-w-0 flex-1 [scrollbar-width:none] overflow-x-auto [&::-webkit-scrollbar]:hidden">
            <AdminNav pendingCount={pendingCount ?? 0} />
          </div>

          <SignOutButton
            className="shrink-0"
            label="Sign out"
            hideLabelOnMobile
          />
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6">{children}</main>
    </AdminShell>
  )
}
