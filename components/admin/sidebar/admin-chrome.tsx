"use client"

import type { ReactNode } from "react"
import { usePathname } from "next/navigation"

import { isAdminChromelessRoute } from "@/lib/admin/nav-config"
import { AdminAppSidebar } from "@/components/admin/sidebar/admin-app-sidebar"
import { AdminHeader } from "@/components/admin/sidebar/admin-header"
import type { AdminSidebarUser } from "@/lib/admin/sidebar-user"
import { TooltipProvider } from "@/components/ui/tooltip"
import { AdminContentBackdrop } from "@/components/admin/ui/admin-content-backdrop"
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar"

interface AdminChromeProps {
  children: ReactNode
  pendingVerificationCount: number
  adminUser: AdminSidebarUser
}

/**
 * Wraps admin pages with the collapsible sidebar shell.
 * Print routes (packing slips) bypass the chrome entirely.
 */
export function AdminChrome({
  children,
  pendingVerificationCount,
  adminUser,
}: AdminChromeProps) {
  const currentPathname = usePathname()
  const shouldHideChrome = isAdminChromelessRoute(currentPathname)

  if (shouldHideChrome) {
    return <>{children}</>
  }

  return (
    <TooltipProvider delay={0}>
      <SidebarProvider>
        <AdminAppSidebar
          pendingVerificationCount={pendingVerificationCount}
          adminUser={adminUser}
        />
        <SidebarInset className="flex min-h-svh flex-col">
          <AdminHeader />
          <AdminContentBackdrop>
            <div className="flex flex-1 flex-col gap-6 p-4 md:p-6">
              {children}
            </div>
          </AdminContentBackdrop>
        </SidebarInset>
      </SidebarProvider>
    </TooltipProvider>
  )
}
