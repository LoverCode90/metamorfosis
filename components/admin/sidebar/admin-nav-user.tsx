"use client"

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import {
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar"
import type { AdminSidebarUser } from "@/lib/admin/sidebar-user"

interface AdminNavUserProps {
  adminUser: AdminSidebarUser
}

function buildUserInitials(displayName: string): string {
  const nameParts = displayName.trim().split(/\s+/).filter(Boolean)
  if (nameParts.length === 0) return "AD"
  if (nameParts.length === 1) return nameParts[0].slice(0, 2).toUpperCase()
  return `${nameParts[0][0] ?? ""}${nameParts[1][0] ?? ""}`.toUpperCase()
}

/** Static decorative user block in the sidebar footer (no menu). */
export function AdminNavUser({ adminUser }: AdminNavUserProps) {
  const userInitials = buildUserInitials(adminUser.displayName)

  return (
    <SidebarMenu>
      <SidebarMenuItem>
        <SidebarMenuButton
          size="lg"
          className="pointer-events-none cursor-default opacity-100"
        >
          <Avatar className="ring-primary/30 size-8 rounded-lg ring-2">
            <AvatarImage
              src={adminUser.avatarUrl ?? undefined}
              alt={adminUser.displayName}
            />
            <AvatarFallback className="bg-primary/20 text-primary rounded-lg text-xs font-semibold">
              {userInitials}
            </AvatarFallback>
          </Avatar>
          <div className="grid flex-1 text-left text-sm leading-tight">
            <span className="truncate font-medium">
              {adminUser.displayName}
            </span>
            <span className="text-muted-foreground truncate text-xs">
              {adminUser.emailAddress}
            </span>
          </div>
        </SidebarMenuButton>
      </SidebarMenuItem>
    </SidebarMenu>
  )
}
