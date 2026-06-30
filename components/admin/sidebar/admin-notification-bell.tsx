"use client"

import Link from "next/link"
import { Bell, MessageCircle } from "lucide-react"

import { useAdminCaseNotifications } from "@/hooks/use-admin-case-notifications"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { cn } from "@/lib/utils"

function formatRelativeTime(isoDate: string): string {
  const diffMs = Date.now() - new Date(isoDate).getTime()
  const diffMinutes = Math.floor(diffMs / 60_000)
  if (diffMinutes < 1) return "Just now"
  if (diffMinutes < 60) return `${diffMinutes}m ago`
  const diffHours = Math.floor(diffMinutes / 60)
  if (diffHours < 24) return `${diffHours}h ago`
  return new Date(isoDate).toLocaleDateString()
}

/** Header bell for customer case messages that need a reply. */
export function AdminNotificationBell() {
  const { notifications, count, isLoading, refresh } =
    useAdminCaseNotifications()

  return (
    <DropdownMenu onOpenChange={(open) => open && refresh()}>
      <DropdownMenuTrigger
        render={
          <Button
            variant="ghost"
            size="icon"
            className="relative size-9 shrink-0"
            aria-label="Notifications"
          />
        }
      >
        <Bell className="size-4" />
        {count > 0 && (
          <span className="bg-primary text-primary-foreground absolute -top-0.5 -right-0.5 flex size-4.5 min-w-4.5 items-center justify-center rounded-full text-[10px] font-semibold">
            {count > 9 ? "9+" : count}
          </span>
        )}
      </DropdownMenuTrigger>

      <DropdownMenuContent align="end" className="w-80">
        <DropdownMenuLabel>Case messages</DropdownMenuLabel>
        <DropdownMenuSeparator />

        {isLoading ? (
          <p className="text-muted-foreground px-2 py-4 text-center text-sm">
            Loading…
          </p>
        ) : notifications.length === 0 ? (
          <p className="text-muted-foreground px-2 py-4 text-center text-sm">
            You have no notifications
          </p>
        ) : (
          notifications.map((notification) => (
            <DropdownMenuItem
              key={notification.latestMessageId}
              className="flex flex-col items-start gap-1 p-3"
              render={
                <Link
                  href={`/admin/cases/${notification.caseId}#case-conversation`}
                />
              }
            >
              <div className="flex w-full items-center gap-2">
                <MessageCircle className="text-primary size-3.5 shrink-0" />
                <span className="text-foreground text-sm font-medium">
                  Case #{notification.caseNumber}
                </span>
                <span className="text-muted-foreground ml-auto text-xs">
                  {formatRelativeTime(notification.createdAt)}
                </span>
              </div>
              <span className="text-muted-foreground text-xs">
                {notification.customerName}
              </span>
              <p
                className={cn(
                  "text-muted-foreground line-clamp-2 w-full text-xs",
                )}
              >
                {notification.messagePreview}
              </p>
            </DropdownMenuItem>
          ))
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
