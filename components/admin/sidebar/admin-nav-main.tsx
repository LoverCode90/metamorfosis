"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { useMemo } from "react"

import {
  ADMIN_PANEL_NAV_ITEMS,
  isAdminNavItemActive,
  type AdminNavBadgeKey,
} from "@/lib/admin/nav-config"
import { Badge } from "@/components/ui/badge"
import {
  SidebarGroup,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar"

interface AdminNavMainProps {
  pendingVerificationCount: number
}

function resolveNavBadgeCount(
  badgeKey: AdminNavBadgeKey | null,
  pendingVerificationCount: number,
): number {
  if (badgeKey === "verifications") return pendingVerificationCount
  return 0
}

/** Primary flat navigation links for the admin sidebar. */
export function AdminNavMain({ pendingVerificationCount }: AdminNavMainProps) {
  const currentPathname = usePathname()

  const navigationItems = useMemo(() => ADMIN_PANEL_NAV_ITEMS, [])

  return (
    <SidebarGroup>
      <SidebarGroupLabel>Operations</SidebarGroupLabel>
      <SidebarMenu>
        {navigationItems.map((navigationItem) => {
          const IconComponent = navigationItem.icon
          const isActive = isAdminNavItemActive(navigationItem, currentPathname)
          const badgeCount = resolveNavBadgeCount(
            navigationItem.badgeKey,
            pendingVerificationCount,
          )

          if (!navigationItem.enabled) {
            return (
              <SidebarMenuItem key={navigationItem.href}>
                <SidebarMenuButton
                  disabled
                  tooltip={navigationItem.label}
                  className="opacity-50"
                >
                  <IconComponent strokeWidth={1.75} />
                  <span>{navigationItem.label}</span>
                </SidebarMenuButton>
              </SidebarMenuItem>
            )
          }

          return (
            <SidebarMenuItem key={navigationItem.href}>
              <SidebarMenuButton
                isActive={isActive}
                tooltip={navigationItem.label}
                render={<Link href={navigationItem.href} />}
              >
                <IconComponent strokeWidth={1.75} />
                <span>{navigationItem.label}</span>
                {badgeCount > 0 && (
                  <Badge className="ml-auto h-5 min-w-5 justify-center rounded-full bg-amber-500 px-1.5 text-[10px] text-white hover:bg-amber-500">
                    {badgeCount > 99 ? "99+" : badgeCount}
                  </Badge>
                )}
              </SidebarMenuButton>
            </SidebarMenuItem>
          )
        })}
      </SidebarMenu>
    </SidebarGroup>
  )
}
