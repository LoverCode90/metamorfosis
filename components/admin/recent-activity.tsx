import {
  Activity,
  ClipboardList,
  Mail,
  ShieldCheck,
  ShoppingBag,
  Truck,
  type LucideIcon,
} from "lucide-react"
import { formatDistanceToNow } from "date-fns"

export interface ActivityEntry {
  id: string
  action: string
  target_table: string
  created_at: string
}

const ACTION_ICONS: Record<string, LucideIcon> = {
  case_status_changed: ClipboardList,
  case_more_info_requested: Mail,
  order_status_changed: ShoppingBag,
  order_label_generated: Truck,
  return_label_generated: Truck,
  verification_approved: ShieldCheck,
  verification_rejected: ShieldCheck,
  pickup_deadline_expired: ShoppingBag,
  admin_cancel_pickup: ShoppingBag,
}

const ACTION_LABELS: Record<string, string> = {
  case_status_changed: "A support case was updated",
  case_more_info_requested: "More information was requested from a customer",
  order_status_changed: "An order was updated",
  order_label_generated: "A shipping label was printed",
  return_label_generated: "A return label was created",
  verification_approved: "A professional license was approved",
  verification_rejected: "A professional license was rejected",
  pickup_deadline_expired: "A store pickup expired and was refunded",
  admin_cancel_pickup: "A store pickup was canceled and refunded",
}

function activityLabel(action: string): string {
  return (
    ACTION_LABELS[action] ??
    action.replace(/_/g, " ").replace(/\b\w/g, (char) => char.toUpperCase())
  )
}

/** Last few audit-log entries with an icon and relative timestamp. */
export function RecentActivity({ entries }: { entries: ActivityEntry[] }) {
  if (entries.length === 0) return null

  return (
    <section>
      <h2 className="text-foreground mb-3 text-base font-semibold">
        Recent activity
      </h2>
      <ul className="border-border divide-border bg-card divide-y rounded-2xl border">
        {entries.map((entry) => {
          const Icon = ACTION_ICONS[entry.action] ?? Activity
          return (
            <li key={entry.id} className="flex items-center gap-3 px-5 py-4">
              <span className="bg-muted text-muted-foreground flex h-9 w-9 shrink-0 items-center justify-center rounded-lg">
                <Icon className="h-4 w-4" strokeWidth={1.75} />
              </span>
              <div className="min-w-0 flex-1">
                <p className="text-foreground text-sm leading-snug font-medium">
                  {activityLabel(entry.action)}
                </p>
              </div>
              <time
                dateTime={entry.created_at}
                className="text-muted-foreground shrink-0 text-sm"
              >
                {formatDistanceToNow(new Date(entry.created_at), {
                  addSuffix: true,
                })}
              </time>
            </li>
          )
        })}
      </ul>
    </section>
  )
}
