"use client"

import { useCallback } from "react"
import { useRouter } from "next/navigation"
import { Bell } from "lucide-react"
import { Popover } from "@base-ui/react/popover"

import { AdminNotificationPanel } from "@/components/admin/sidebar/admin-notification-panel"
import { useAdminCaseNotifications } from "@/hooks/use-admin-case-notifications"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

/** Header bell — opens a notifications panel; items link to the case chat. */
export function AdminNotificationBell() {
  const router = useRouter()
  const { notifications, count, isLoading, refresh } =
    useAdminCaseNotifications()

  const handleNotificationClick = useCallback(
    (caseId: string) => {
      router.push(`/admin/cases/${caseId}#case-conversation`)
    },
    [router],
  )

  return (
    <Popover.Root onOpenChange={(open) => open && refresh()}>
      <Popover.Trigger
        render={
          <Button
            type="button"
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
      </Popover.Trigger>

      <Popover.Portal>
        <Popover.Positioner align="end" sideOffset={8} className="z-50">
          <Popover.Popup
            className={cn(
              "bg-popover text-popover-foreground border-border w-[min(100vw-2rem,22rem)] overflow-hidden rounded-xl border shadow-lg",
              "data-open:animate-in data-open:fade-in-0 data-open:zoom-in-95",
              "data-closed:animate-out data-closed:fade-out-0 data-closed:zoom-out-95",
            )}
          >
            <div className="border-border border-b px-4 py-3">
              <h2 className="text-foreground text-sm font-semibold">
                Notifications
              </h2>
            </div>

            <div className="max-h-[min(24rem,60dvh)] overflow-y-auto">
              <AdminNotificationPanel
                notifications={notifications}
                isLoading={isLoading}
                onNotificationClick={handleNotificationClick}
              />
            </div>
          </Popover.Popup>
        </Popover.Positioner>
      </Popover.Portal>
    </Popover.Root>
  )
}
