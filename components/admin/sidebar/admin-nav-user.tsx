"use client"

import { useState } from "react"
import { ChevronsUpDown, LogOut, Settings, Store } from "lucide-react"
import Link from "next/link"

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@/components/ui/sidebar"

export interface AdminSidebarUser {
  displayName: string
  emailAddress: string
  avatarUrl: string | null
}

interface AdminNavUserProps {
  adminUser: AdminSidebarUser
}

function buildInitials(displayName: string): string {
  const nameParts = displayName.trim().split(/\s+/).filter(Boolean)
  if (nameParts.length === 0) return "AD"
  if (nameParts.length === 1) return nameParts[0].slice(0, 2).toUpperCase()
  return `${nameParts[0][0] ?? ""}${nameParts[1][0] ?? ""}`.toUpperCase()
}

/** Admin profile menu anchored in the sidebar footer. */
export function AdminNavUser({ adminUser }: AdminNavUserProps) {
  const { isMobile } = useSidebar()
  const [signOutDialogOpen, setSignOutDialogOpen] = useState(false)
  const [signOutPending, setSignOutPending] = useState(false)
  const userInitials = buildInitials(adminUser.displayName)

  async function confirmSignOut() {
    setSignOutPending(true)
    try {
      await fetch("/api/auth/signout", { method: "POST" })
      window.location.href = "/"
    } catch {
      setSignOutPending(false)
    }
  }

  return (
    <>
      <SidebarMenu>
        <SidebarMenuItem>
          <DropdownMenu>
            <DropdownMenuTrigger
              render={
                <SidebarMenuButton
                  size="lg"
                  className="aria-expanded:bg-muted"
                />
              }
            >
              <Avatar className="size-8 rounded-lg">
                <AvatarImage
                  src={adminUser.avatarUrl ?? undefined}
                  alt={adminUser.displayName}
                />
                <AvatarFallback className="rounded-lg">
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
              <ChevronsUpDown className="ml-auto size-4" />
            </DropdownMenuTrigger>
            <DropdownMenuContent
              className="w-(--radix-dropdown-menu-trigger-width) min-w-56 rounded-lg"
              side={isMobile ? "bottom" : "right"}
              align="end"
              sideOffset={4}
            >
              <DropdownMenuLabel className="p-0 font-normal">
                <div className="flex items-center gap-2 px-1 py-1.5 text-left text-sm">
                  <Avatar className="size-8 rounded-lg">
                    <AvatarImage
                      src={adminUser.avatarUrl ?? undefined}
                      alt={adminUser.displayName}
                    />
                    <AvatarFallback className="rounded-lg">
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
                </div>
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuGroup>
                <DropdownMenuItem render={<Link href="/" />}>
                  <Store />
                  View storefront
                </DropdownMenuItem>
                <DropdownMenuItem render={<Link href="/admin/settings" />}>
                  <Settings />
                  Admin settings
                </DropdownMenuItem>
              </DropdownMenuGroup>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                variant="destructive"
                onClick={() => setSignOutDialogOpen(true)}
              >
                <LogOut />
                Sign out
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </SidebarMenuItem>
      </SidebarMenu>

      <Dialog
        open={signOutDialogOpen}
        onOpenChange={(open) => !signOutPending && setSignOutDialogOpen(open)}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Sign out of admin?</DialogTitle>
            <DialogDescription>
              You will need to sign back in to access the admin panel.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setSignOutDialogOpen(false)}
              disabled={signOutPending}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={confirmSignOut}
              disabled={signOutPending}
            >
              {signOutPending ? "Signing out…" : "Sign out"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}
