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
}

function actionLabel(action: string): string {
  return action
    .replace(/_/g, " ")
    .replace(/\b\w/g, (char) => char.toUpperCase())
}

/** Last few audit-log entries with an icon and relative timestamp. */
export function RecentActivity({ entries }: { entries: ActivityEntry[] }) {
  if (entries.length === 0) return null

  return (
    <section>
      <h2 className="text-foreground mb-3 text-sm font-semibold">
        Recent activity
      </h2>
      <ul className="border-border divide-border bg-card divide-y rounded-2xl border">
        {entries.map((entry) => {
          const Icon = ACTION_ICONS[entry.action] ?? Activity
          return (
            <li key={entry.id} className="flex items-center gap-3 px-5 py-3">
              <span className="bg-muted text-muted-foreground flex h-8 w-8 shrink-0 items-center justify-center rounded-lg">
                <Icon className="h-4 w-4" strokeWidth={1.75} />
              </span>
              <div className="min-w-0 flex-1">
                <p className="text-foreground truncate text-sm font-medium">
                  {actionLabel(entry.action)}
                </p>
                <p className="text-muted-foreground text-xs capitalize">
                  {entry.target_table}
                </p>
              </div>
              <time
                dateTime={entry.created_at}
                className="text-muted-foreground shrink-0 text-xs"
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
