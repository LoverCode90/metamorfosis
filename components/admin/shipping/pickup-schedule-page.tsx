"use client"

import { AlertCircle, Loader2 } from "lucide-react"

import { PickupConfirmDialog } from "@/components/admin/shipping/pickup-confirm-dialog"
import { PickupOrdersTable } from "@/components/admin/shipping/pickup-orders-table"
import { PickupPageTabs } from "@/components/admin/shipping/pickup-page-tabs"
import { PickupScheduleDialog } from "@/components/admin/shipping/pickup-schedule-dialog"
import { PickupScheduledCarrierCard } from "@/components/admin/shipping/pickup-scheduled-carrier-card"
import { PickupTimeSlotChart } from "@/components/admin/shipping/pickup-time-slot-chart"
import { PickupToolbar } from "@/components/admin/shipping/pickup-toolbar"
import { AdminPageHeader } from "@/components/admin/ui/admin-page-header"
import { Button } from "@/components/ui/button"
import type {
  PickupScheduledTabResponse,
  PickupTabResponse,
} from "@/lib/admin/carrier-pickup-types"
import { usePickupSchedulePage } from "@/hooks/use-pickup-schedule-page"

interface PickupSchedulePageProps {
  initialTabData: PickupTabResponse
}

export function PickupSchedulePage({
  initialTabData,
}: PickupSchedulePageProps) {
  const page = usePickupSchedulePage({ initialTabData })
  const scheduledData: PickupScheduledTabResponse | null =
    page.tabData.tab === "scheduled"
      ? (page.tabData as PickupScheduledTabResponse)
      : null

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <AdminPageHeader
          title="Schedule Pickup"
          description="Select labeled packages, schedule a carrier window, and track pickups."
        />
        <PickupPageTabs
          activeTab={page.activeTab}
          onTabChange={page.handleTabChange}
        />
      </div>

      {page.activeTab === "ready" && (
        <PickupToolbar
          searchQuery={page.searchQuery}
          onSearchChange={page.setSearchQuery}
          selectedCount={page.selectedIds.size}
          onScheduleClick={page.openScheduleFlow}
        />
      )}

      {page.isLoading && (
        <div className="text-muted-foreground flex items-center gap-2 text-sm">
          <Loader2 className="size-4 animate-spin" />
          Loading…
        </div>
      )}

      {page.error && (
        <div className="border-destructive/20 bg-destructive/10 text-destructive flex items-start gap-2 rounded-lg border p-3 text-sm">
          <AlertCircle className="mt-0.5 size-4 shrink-0" />
          <p>{page.error}</p>
        </div>
      )}

      {page.activeTab === "ready" && (
        <PickupOrdersTable
          rows={page.readyRows}
          selectable
          selectedIds={page.selectedIds}
          onToggleSelect={page.toggleSelect}
          onToggleAll={page.toggleAll}
          emptyMessage="No confirmed packages waiting for pickup. Print labels from Orders first."
        />
      )}

      {page.activeTab === "scheduled" && scheduledData && (
        <div className="space-y-6">
          <PickupScheduledCarrierCard
            carrier="usps"
            rows={scheduledData.usps}
            confirmationCode={
              scheduledData.usps[0]?.pickupWindow?.confirmationCode
            }
          />
          <PickupScheduledCarrierCard
            carrier="dhl_express"
            rows={scheduledData.dhlExpress}
            confirmationCode={
              scheduledData.dhlExpress[0]?.pickupWindow?.confirmationCode
            }
          />
          <PickupTimeSlotChart
            slotKey={scheduledData.pickupMeta?.slotKey ?? null}
          />
        </div>
      )}

      {page.activeTab === "history" && (
        <div className="space-y-4">
          <PickupOrdersTable
            rows={page.historyDisplayRows}
            emptyMessage="No completed pickups yet."
          />
          {page.historyHasMore && (
            <div className="flex justify-center">
              <Button
                type="button"
                variant="outline"
                onClick={page.loadMoreHistory}
                disabled={page.isLoading}
              >
                See more
              </Button>
            </div>
          )}
        </div>
      )}

      <PickupScheduleDialog
        open={page.scheduleOpen}
        onOpenChange={page.setScheduleOpen}
        pickupDate={page.pickupDate}
        onDateChange={page.setPickupDate}
        slotKey={page.slotKey}
        onSlotChange={page.setSlotKey}
        instructions={page.instructions}
        onInstructionsChange={page.setInstructions}
        selectedCount={page.selectedIds.size}
        onContinue={page.handleScheduleContinue}
      />

      <PickupConfirmDialog
        open={page.confirmOpen}
        onOpenChange={page.setConfirmOpen}
        pickupDate={page.pickupDate}
        slotKey={page.slotKey}
        selectedCount={page.selectedIds.size}
        carriers={page.selectedCarriers}
        onConfirm={page.confirmSchedule}
        isSubmitting={page.isScheduling}
      />
    </div>
  )
}
