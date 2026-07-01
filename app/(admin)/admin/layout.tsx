import Script from "next/script"
import { requireAdmin } from "@/lib/auth/helpers"
import { createAdminClient } from "@/lib/supabase/admin"
import { countPendingStorePickups } from "@/lib/admin/count-pending-store-pickups"
import type { AdminNavBadgeCounts } from "@/lib/admin/nav-config"
import { AdminShell } from "@/components/admin/admin-shell"
import { AdminChrome } from "@/components/admin/sidebar/admin-chrome"
import type { AdminSidebarUser } from "@/lib/admin/sidebar-user"

export const metadata = { title: "Admin — Metamorfosis Beauty" }

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const authenticatedUser = await requireAdmin()

  const adminClient = createAdminClient()

  const [
    { count: pendingVerificationCount },
    pendingStorePickupsCount,
    { data: adminProfile },
  ] = await Promise.all([
    adminClient
      .from("profiles")
      .select("id", { count: "exact", head: true })
      .eq("verification_status", "pending_review"),
    countPendingStorePickups(),
    adminClient
      .from("profiles")
      .select("full_name")
      .eq("id", authenticatedUser.id)
      .single(),
  ])

  const navBadgeCounts: AdminNavBadgeCounts = {
    verifications: pendingVerificationCount ?? 0,
    storePickups: pendingStorePickupsCount,
  }

  const adminSidebarUser: AdminSidebarUser = {
    displayName:
      adminProfile?.full_name?.trim() ||
      authenticatedUser.email?.split("@")[0] ||
      "Admin",
    emailAddress: authenticatedUser.email ?? "",
    avatarUrl: null,
  }

  return (
    <>
      <Script
        id="admin-theme-init"
        strategy="beforeInteractive"
        dangerouslySetInnerHTML={{
          __html: `(function(){try{localStorage.setItem("admin-theme","dark");document.documentElement.dataset.adminTheme="dark";}catch(e){}})();`,
        }}
      />
      <AdminShell>
        <AdminChrome
          navBadgeCounts={navBadgeCounts}
          adminUser={adminSidebarUser}
        >
          {children}
        </AdminChrome>
      </AdminShell>
    </>
  )
}
