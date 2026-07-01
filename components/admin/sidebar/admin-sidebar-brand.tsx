"use client"

import Link from "next/link"
import { Store } from "lucide-react"

import {
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar"

/** Brand header for the admin sidebar. */
export function AdminSidebarBrand() {
  return (
    <SidebarMenu>
      <SidebarMenuItem>
        <SidebarMenuButton
          tooltip="Metamorfosis Admin"
          render={<Link href="/admin" />}
          className="group-data-[collapsible=icon]:justify-center"
        >
          <div className="bg-primary text-primary-foreground flex aspect-square size-8 shrink-0 items-center justify-center rounded-lg">
            <Store className="size-4" strokeWidth={2} />
          </div>
          <div className="grid flex-1 text-left text-sm leading-tight group-data-[collapsible=icon]:hidden">
            <span className="truncate font-semibold">Metamorfosis</span>
            <span className="text-muted-foreground truncate text-xs">
              Admin panel
            </span>
          </div>
        </SidebarMenuButton>
      </SidebarMenuItem>
    </SidebarMenu>
  )
}
