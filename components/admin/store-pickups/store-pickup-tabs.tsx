import Link from "next/link"

import { cn } from "@/lib/utils"
import type { StorePickupTab } from "@/lib/admin/store-pickup-types"

const TABS: { id: StorePickupTab; label: string }[] = [
  { id: "pending", label: "Pending" },
  { id: "canceled", label: "Canceled" },
  { id: "history", label: "History" },
]

interface StorePickupTabsProps {
  activeTab: StorePickupTab
  pendingCount: number
}

export function StorePickupTabs({
  activeTab,
  pendingCount,
}: StorePickupTabsProps) {
  return (
    <div className="flex flex-wrap gap-2">
      {TABS.map((tab) => (
        <Link
          key={tab.id}
          href={`/admin/store-pickups?tab=${tab.id}`}
          className={cn(
            "inline-flex min-h-11 items-center gap-2 rounded-full border px-5 py-2.5 text-sm font-semibold transition-colors",
            activeTab === tab.id
              ? "border-foreground bg-foreground text-background"
              : "border-border text-muted-foreground hover:bg-muted",
          )}
        >
          {tab.label}
          {tab.id === "pending" && pendingCount > 0 && (
            <span className="bg-primary text-primary-foreground flex h-6 min-w-6 items-center justify-center rounded-full px-2 text-xs font-bold">
              {pendingCount > 99 ? "99+" : pendingCount}
            </span>
          )}
        </Link>
      ))}
    </div>
  )
}
