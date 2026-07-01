"use client"

import type { ComponentProps } from "react"

import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarRail,
} from "@/components/ui/sidebar"
import { AdminNavMain } from "@/components/admin/sidebar/admin-nav-main"
import { AdminNavQuickLinks } from "@/components/admin/sidebar/admin-nav-quick-links"
import { AdminNavUser } from "@/components/admin/sidebar/admin-nav-user"
import { AdminSidebarBrand } from "@/components/admin/sidebar/admin-sidebar-brand"
import type { AdminNavBadgeCounts } from "@/lib/admin/nav-config"
import type { AdminSidebarUser } from "@/lib/admin/sidebar-user"

interface AdminAppSidebarProps extends ComponentProps<typeof Sidebar> {
  navBadgeCounts: AdminNavBadgeCounts
  adminUser: AdminSidebarUser
}

/** Collapsible admin sidebar based on shadcn sidebar-07. */
export function AdminAppSidebar({
  navBadgeCounts,
  adminUser,
  ...sidebarProps
}: AdminAppSidebarProps) {
  return (
    <Sidebar collapsible="icon" {...sidebarProps}>
      <SidebarHeader>
        <AdminSidebarBrand />
      </SidebarHeader>
      <SidebarContent>
        <AdminNavMain navBadgeCounts={navBadgeCounts} />
        <AdminNavQuickLinks />
      </SidebarContent>
      <SidebarFooter>
        <AdminNavUser adminUser={adminUser} />
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  )
}
