"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { useMemo } from "react"

import {
  ADMIN_PANEL_NAV_ITEMS,
  isAdminNavItemActive,
  type AdminNavBadgeCounts,
  type AdminNavBadgeKey,
} from "@/lib/admin/nav-config"
import { cn } from "@/lib/utils"
import {
  SidebarGroup,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar"

interface AdminNavMainProps {
  navBadgeCounts: AdminNavBadgeCounts
}

function resolveNavBadgeCount(
  badgeKey: AdminNavBadgeKey | null,
  navBadgeCounts: AdminNavBadgeCounts,
): number {
  if (!badgeKey) return 0
  return navBadgeCounts[badgeKey]
}

/** Primary flat navigation links for the admin sidebar. */
export function AdminNavMain({ navBadgeCounts }: AdminNavMainProps) {
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
            navBadgeCounts,
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
                className={cn(
                  "group-data-[collapsible=icon]:justify-center group-data-[collapsible=icon]:border-0 group-data-[collapsible=icon]:shadow-none",
                  isActive &&
                    "data-active:bg-primary/15 data-active:text-primary border-primary/20 [&_svg]:text-primary group-data-[collapsible=icon]:data-active:bg-primary/20 border shadow-[inset_0_0_0_1px_color-mix(in_oklch,var(--primary)_35%,transparent)]",
                )}
              >
                <IconComponent strokeWidth={1.75} />
                <span className="group-data-[collapsible=icon]:hidden">
                  {navigationItem.label}
                </span>
                {badgeCount > 0 && (
                  <span className="bg-primary text-primary-foreground ml-auto flex h-5 min-w-5 items-center justify-center rounded-full px-1.5 text-[10px] font-semibold group-data-[collapsible=icon]:hidden">
                    {badgeCount > 99 ? "99+" : badgeCount}
                  </span>
                )}
              </SidebarMenuButton>
            </SidebarMenuItem>
          )
        })}
      </SidebarMenu>
    </SidebarGroup>
  )
}
