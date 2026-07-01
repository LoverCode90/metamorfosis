import { cn } from "@/lib/utils"
import type { PickupPageTab } from "@/lib/admin/carrier-pickup-types"

const TABS: { id: PickupPageTab; label: string }[] = [
  { id: "ready", label: "Ready" },
  { id: "scheduled", label: "On Schedule" },
  { id: "history", label: "History" },
]

interface PickupPageTabsProps {
  activeTab: PickupPageTab
  onTabChange: (tab: PickupPageTab) => void
}

export function PickupPageTabs({
  activeTab,
  onTabChange,
}: PickupPageTabsProps) {
  return (
    <div className="flex flex-wrap gap-2">
      {TABS.map((tab) => (
        <button
          key={tab.id}
          type="button"
          onClick={() => onTabChange(tab.id)}
          className={cn(
            "rounded-full border px-4 py-1.5 text-xs font-medium transition-colors",
            activeTab === tab.id
              ? "border-foreground bg-foreground text-background"
              : "border-border text-muted-foreground hover:bg-muted",
          )}
        >
          {tab.label}
        </button>
      ))}
    </div>
  )
}
