import type { AdminCaseNotification } from "@/hooks/use-admin-case-notifications"
import { AdminNotificationItem } from "@/components/admin/sidebar/admin-notification-item"

interface AdminNotificationPanelProps {
  notifications: AdminCaseNotification[]
  isLoading: boolean
  onNotificationClick: (caseId: string) => void
}

/** Scrollable list body for the admin notifications popover. */
export function AdminNotificationPanel({
  notifications,
  isLoading,
  onNotificationClick,
}: AdminNotificationPanelProps) {
  if (isLoading) {
    return (
      <p className="text-muted-foreground px-4 py-8 text-center text-sm">
        Loading…
      </p>
    )
  }

  if (notifications.length === 0) {
    return (
      <p className="text-muted-foreground px-4 py-8 text-center text-sm">
        You have no recent notifications
      </p>
    )
  }

  return (
    <ul className="divide-border divide-y">
      {notifications.map((notification) => (
        <AdminNotificationItem
          key={notification.latestMessageId}
          notification={notification}
          onNotificationClick={onNotificationClick}
        />
      ))}
    </ul>
  )
}
