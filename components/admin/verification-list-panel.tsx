"use client"

import { Loader2, RefreshCw } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { VerificationListItem } from "@/components/admin/verification-list-item"
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

/** Left column: status tabs, refresh, the verification list, and load-more. */
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
    <div className="flex w-full max-w-md flex-col gap-4 lg:w-[420px] lg:shrink-0">
      <Tabs
        value={filter}
        onValueChange={(v) => onFilterChange(v as StatusFilter)}
      >
        <TabsList className="w-full">
          {FILTER_TABS.map((tab) => (
            <TabsTrigger key={tab.value} value={tab.value}>
              {tab.label}
            </TabsTrigger>
          ))}
        </TabsList>
      </Tabs>

      <Button
        variant="ghost"
        size="sm"
        onClick={onRefresh}
        disabled={isLoading}
        className="text-muted-foreground self-end"
      >
        <RefreshCw className="h-3 w-3" strokeWidth={2} />
        Refresh
      </Button>

      <div className="flex-1 overflow-y-auto">
        {isLoading ? (
          <div className="flex items-center justify-center py-16">
            <Loader2 className="text-muted-foreground h-6 w-6 animate-spin" />
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
    </div>
  )
}
