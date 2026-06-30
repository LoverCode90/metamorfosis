"use client"

import { Loader2, RefreshCw } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { VerificationListItem } from "@/components/admin/verification-list-item"
import { AdminSurfaceCard } from "@/components/admin/ui/admin-surface-card"
import {
  FILTER_TABS,
  type StatusFilter,
  type VerificationRow,
} from "@/lib/admin/verifications"

interface VerificationListPanelProps {
  filter: StatusFilter
  onFilterChange: (filter: StatusFilter) => void
  items: VerificationRow[]
  selectedId: string | null
  onSelect: (item: VerificationRow) => void
  isLoading: boolean
  isLoadingMore: boolean
  hasMore: boolean
  onRefresh: () => void
  onLoadMore: () => void
}

/** Filter tabs + scrollable verification list. */
export function VerificationListPanel({
  filter,
  onFilterChange,
  items,
  selectedId,
  onSelect,
  isLoading,
  isLoadingMore,
  hasMore,
  onRefresh,
  onLoadMore,
}: VerificationListPanelProps) {
  return (
    <AdminSurfaceCard
      className="flex w-full flex-col lg:w-[400px] lg:shrink-0 xl:w-[420px]"
      contentClassName="flex min-h-0 flex-1 flex-col gap-4"
      title="Queue"
      description="Filter and select a submission to review."
      headerAction={
        <Button
          variant="ghost"
          size="sm"
          onClick={onRefresh}
          disabled={isLoading}
          className="text-muted-foreground h-8 px-2"
        >
          <RefreshCw className="size-3.5" />
          Refresh
        </Button>
      }
    >
      <Tabs
        value={filter}
        onValueChange={(value) => onFilterChange(value as StatusFilter)}
      >
        <TabsList className="grid w-full grid-cols-3">
          {FILTER_TABS.map((tab) => (
            <TabsTrigger key={tab.value} value={tab.value} className="text-xs">
              {tab.label}
            </TabsTrigger>
          ))}
        </TabsList>
      </Tabs>

      <div className="min-h-[280px] flex-1 overflow-y-auto lg:max-h-[calc(100dvh-18rem)]">
        {isLoading ? (
          <div className="flex items-center justify-center py-16">
            <Loader2 className="text-muted-foreground size-6 animate-spin" />
          </div>
        ) : items.length === 0 ? (
          <div className="text-muted-foreground py-16 text-center text-sm">
            No verifications found.
          </div>
        ) : (
          <ul className="space-y-2">
            {items.map((item) => (
              <li key={item.id}>
                <VerificationListItem
                  item={item}
                  selected={selectedId === item.id}
                  onSelect={() => onSelect(item)}
                />
              </li>
            ))}
          </ul>
        )}

        {hasMore && !isLoading && (
          <Button
            variant="ghost"
            onClick={onLoadMore}
            disabled={isLoadingMore}
            className="text-muted-foreground mt-3 w-full"
          >
            {isLoadingMore ? "Loading…" : "Load more"}
          </Button>
        )}
      </div>
    </AdminSurfaceCard>
  )
}
