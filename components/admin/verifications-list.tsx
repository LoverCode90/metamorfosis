"use client"

import { VerificationDetail } from "@/components/admin/verification-detail"
import { VerificationDetailSheet } from "@/components/admin/verification-detail-sheet"
import { VerificationListPanel } from "@/components/admin/verification-list-panel"
import { AdminSurfaceCard } from "@/components/admin/ui/admin-surface-card"
import { useVerifications } from "@/hooks/use-verifications"

/**
 * Admin dashboard for reviewing professional/student verification requests.
 * Two-pane on desktop and a bottom sheet on mobile.
 */
export function VerificationsDashboard() {
  const {
    filter,
    setFilter,
    items,
    selected: selectedVerification,
    setSelected,
    isLoading,
    isLoadingMore,
    hasMore,
    refresh,
    loadMore,
    approve,
    reject,
  } = useVerifications()

  return (
    <div className="flex min-h-0 flex-1 flex-col gap-4 lg:flex-row lg:gap-6">
      <VerificationListPanel
        filter={filter}
        onFilterChange={setFilter}
        items={items}
        selectedId={selectedVerification?.id ?? null}
        onSelect={setSelected}
        isLoading={isLoading}
        isLoadingMore={isLoadingMore}
        hasMore={hasMore}
        onRefresh={refresh}
        onLoadMore={loadMore}
      />

      <div className="hidden min-h-0 min-w-0 flex-1 lg:flex lg:flex-col">
        {selectedVerification ? (
          <AdminSurfaceCard
            className="flex min-h-0 flex-1 flex-col"
            contentClassName="flex min-h-0 flex-1 flex-col p-0"
          >
            <VerificationDetail
              item={selectedVerification}
              onApprove={approve}
              onReject={reject}
            />
          </AdminSurfaceCard>
        ) : (
          <AdminSurfaceCard className="flex min-h-[320px] flex-1 items-center justify-center">
            <p className="text-muted-foreground text-sm">
              Select a verification to review
            </p>
          </AdminSurfaceCard>
        )}
      </div>

      <VerificationDetailSheet
        item={selectedVerification}
        onClose={() => setSelected(null)}
        onApprove={approve}
        onReject={reject}
      />
    </div>
  )
}
