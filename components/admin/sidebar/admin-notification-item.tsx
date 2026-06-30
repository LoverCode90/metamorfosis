import type { AdminCaseNotification } from "@/hooks/use-admin-case-notifications"
import { displayInitialsFromName } from "@/lib/admin/display-initials"
import { formatAdminRelativeTime } from "@/lib/admin/format-relative-time"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { MessageCircle } from "lucide-react"
import { memo } from "react"

interface AdminNotificationItemProps {
  notification: AdminCaseNotification
  onNotificationClick: (caseId: string) => void
}

/** Single row inside the admin notifications dropdown. */
export const AdminNotificationItem = memo(function AdminNotificationItem({
  notification,
  onNotificationClick,
}: AdminNotificationItemProps) {
  return (
    <li>
      <button
        type="button"
        className="hover:bg-muted/60 flex w-full gap-3 px-4 py-3 text-left transition-colors"
        onClick={() => onNotificationClick(notification.caseId)}
      >
        <div className="relative shrink-0">
          <Avatar className="size-10">
            <AvatarFallback className="bg-muted text-foreground text-xs font-medium">
              {displayInitialsFromName(notification.customerName)}
            </AvatarFallback>
          </Avatar>
          <span className="bg-primary text-primary-foreground absolute -right-0.5 -bottom-0.5 flex size-4.5 items-center justify-center rounded-full ring-2 ring-[var(--popover)]">
            <MessageCircle className="size-2.5" />
          </span>
        </div>

        <div className="min-w-0 flex-1">
          <p className="text-foreground text-sm leading-snug">
            <span className="font-semibold">{notification.customerName}</span>{" "}
            <span className="text-muted-foreground">
              · Case #{notification.caseNumber}
            </span>
          </p>
          <p className="text-muted-foreground mt-0.5 line-clamp-2 text-xs">
            {notification.messagePreview}
          </p>
          <p className="text-muted-foreground mt-1 text-[11px]">
            {formatAdminRelativeTime(notification.createdAt)}
          </p>
        </div>
      </button>
    </li>
  )
})

AdminNotificationItem.displayName = "AdminNotificationItem"
