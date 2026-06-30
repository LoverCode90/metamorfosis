import Script from "next/script"
import { requireAdmin } from "@/lib/auth/helpers"
import { createAdminClient } from "@/lib/supabase/admin"
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

  const [{ count: pendingVerificationCount }, { data: adminProfile }] =
    await Promise.all([
      adminClient
        .from("profiles")
        .select("id", { count: "exact", head: true })
        .eq("verification_status", "pending_review"),
      adminClient
        .from("profiles")
        .select("full_name")
        .eq("id", authenticatedUser.id)
        .single(),
    ])

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
          __html: `(function(){try{var t=localStorage.getItem("admin-theme");if(t==="light"||t==="dark"){document.documentElement.dataset.adminTheme=t;}}catch(e){}})();`,
        }}
      />
      <AdminShell>
        <AdminChrome
          pendingVerificationCount={pendingVerificationCount ?? 0}
          adminUser={adminSidebarUser}
        >
          {children}
        </AdminChrome>
      </AdminShell>
    </>
  )
}
