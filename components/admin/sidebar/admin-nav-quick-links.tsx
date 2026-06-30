"use client"

import Link from "next/link"

import { ADMIN_QUICK_LINK_ITEMS } from "@/lib/admin/nav-config"
import {
  SidebarGroup,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar"

/** Secondary shortcuts below the main admin navigation. */
export function AdminNavQuickLinks() {
  return (
    <SidebarGroup className="group-data-[collapsible=icon]:hidden">
      <SidebarGroupLabel>Shortcuts</SidebarGroupLabel>
      <SidebarMenu>
        {ADMIN_QUICK_LINK_ITEMS.map((quickLinkItem) => {
          const IconComponent = quickLinkItem.icon

          return (
            <SidebarMenuItem key={quickLinkItem.href}>
              <SidebarMenuButton
                tooltip={quickLinkItem.label}
                render={
                  quickLinkItem.opensInNewTab ? (
                    <a
                      href={quickLinkItem.href}
                      target="_blank"
                      rel="noopener noreferrer"
                    />
                  ) : (
                    <Link href={quickLinkItem.href} />
                  )
                }
              >
                <IconComponent strokeWidth={1.75} />
                <span>{quickLinkItem.label}</span>
              </SidebarMenuButton>
            </SidebarMenuItem>
          )
        })}
      </SidebarMenu>
    </SidebarGroup>
  )
}
