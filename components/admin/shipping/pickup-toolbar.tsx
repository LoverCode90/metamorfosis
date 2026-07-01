import { Plus, Search } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"

interface PickupToolbarProps {
  searchQuery: string
  onSearchChange: (value: string) => void
  selectedCount: number
  onScheduleClick: () => void
  showScheduleButton?: boolean
}

export function PickupToolbar({
  searchQuery,
  onSearchChange,
  selectedCount,
  onScheduleClick,
  showScheduleButton = true,
}: PickupToolbarProps) {
  return (
    <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
      <div className="relative max-w-sm flex-1">
        <Search className="text-muted-foreground absolute top-1/2 left-3 size-4 -translate-y-1/2" />
        <Input
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
          placeholder="Search recipient…"
          className="h-10 pl-9"
        />
      </div>
      {showScheduleButton && (
        <Button
          type="button"
          disabled={selectedCount === 0}
          onClick={onScheduleClick}
          className="h-10 gap-2 bg-violet-600 text-white hover:bg-violet-700 disabled:opacity-50"
        >
          <Plus className="size-4" />
          Schedule Pickup
          {selectedCount > 0 ? ` (${selectedCount})` : ""}
        </Button>
      )}
    </div>
  )
}
