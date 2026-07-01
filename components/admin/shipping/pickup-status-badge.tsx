import { Badge } from "@/components/ui/badge"
import type { PickupOrderStatus } from "@/lib/admin/carrier-pickup-types"
import { cn } from "@/lib/utils"

const STATUS_CONFIG: Record<
  PickupOrderStatus,
  { label: string; className: string }
> = {
  unscheduled: {
    label: "Unscheduled",
    className:
      "border-amber-500/30 bg-amber-500/10 text-amber-700 dark:text-amber-400",
  },
  scheduled: {
    label: "Scheduled",
    className:
      "border-violet-500/30 bg-violet-500/10 text-violet-700 dark:text-violet-400",
  },
  completed: {
    label: "Completed",
    className:
      "border-emerald-500/30 bg-emerald-500/10 text-emerald-700 dark:text-emerald-400",
  },
}

interface PickupStatusBadgeProps {
  status: PickupOrderStatus
}

export function PickupStatusBadge({ status }: PickupStatusBadgeProps) {
  const config = STATUS_CONFIG[status]
  return (
    <Badge
      variant="outline"
      className={cn(
        "rounded-full px-2.5 py-0.5 text-[11px] font-medium",
        config.className,
      )}
    >
      {config.label}
    </Badge>
  )
}
