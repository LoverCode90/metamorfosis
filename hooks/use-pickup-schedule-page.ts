"use client"

import { useCallback, useMemo, useState } from "react"
import { addDays, format } from "date-fns"

import type {
  PickupOrderRow,
  PickupPageTab,
  PickupScheduledTabResponse,
  PickupTabResponse,
  SchedulePickupsResponse,
} from "@/lib/admin/carrier-pickup-types"
import type { CarrierPickupSlotKey } from "@/lib/admin/pickup-slots"
import type { PickupCarrierKind } from "@/lib/admin/pickup-carrier"

type TabData = PickupTabResponse | PickupScheduledTabResponse

async function fetchTab(tab: PickupPageTab, offset: number): Promise<TabData> {
  const params = new URLSearchParams({ tab })
  if (tab === "history") {
    params.set("offset", String(offset))
    params.set("limit", "10")
  }
  const res = await fetch(`/api/admin/shipping/pickups?${params}`)
  const payload = await res.json()
  if (!res.ok) throw new Error(payload.error ?? "Failed to load pickups")
  return payload as TabData
}

function filterRows(rows: PickupOrderRow[], query: string): PickupOrderRow[] {
  const q = query.trim().toLowerCase()
  if (!q) return rows
  return rows.filter(
    (r) =>
      r.recipientName.toLowerCase().includes(q) ||
      (r.trackingNumber?.toLowerCase().includes(q) ?? false),
  )
}

interface UsePickupSchedulePageArgs {
  initialTabData: PickupTabResponse
}

export function usePickupSchedulePage({
  initialTabData,
}: UsePickupSchedulePageArgs) {
  const [activeTab, setActiveTab] = useState<PickupPageTab>("ready")
  const [tabData, setTabData] = useState<TabData>(initialTabData)
  const [historyOffset, setHistoryOffset] = useState(0)
  const [historyRows, setHistoryRows] = useState<PickupOrderRow[]>(
    initialTabData.tab === "history" ? initialTabData.rows : [],
  )
  const [historyHasMore, setHistoryHasMore] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set())
  const [searchQuery, setSearchQuery] = useState("")

  const [scheduleOpen, setScheduleOpen] = useState(false)
  const [confirmOpen, setConfirmOpen] = useState(false)
  const [pickupDate, setPickupDate] = useState<Date | undefined>(
    addDays(new Date(), 1),
  )
  const [slotKey, setSlotKey] = useState<CarrierPickupSlotKey | null>(null)
  const [instructions, setInstructions] = useState("")
  const [isScheduling, setIsScheduling] = useState(false)

  const loadTab = useCallback(async (tab: PickupPageTab, offset = 0) => {
    setIsLoading(true)
    setError(null)
    try {
      const data = await fetchTab(tab, offset)
      setTabData(data)
      if (data.tab === "history") {
        if (offset === 0) {
          setHistoryRows(data.rows)
        } else {
          setHistoryRows((prev) => [...prev, ...data.rows])
        }
        setHistoryOffset(offset)
        setHistoryHasMore(data.hasMore)
      }
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Failed to load")
    } finally {
      setIsLoading(false)
    }
  }, [])

  const handleTabChange = useCallback(
    (tab: PickupPageTab) => {
      setActiveTab(tab)
      setSelectedIds(new Set())
      setSearchQuery("")
      if (tab === "history") {
        setHistoryRows([])
        void loadTab(tab, 0)
      } else {
        void loadTab(tab, 0)
      }
    },
    [loadTab],
  )

  const readyRows = useMemo(() => {
    if (tabData.tab !== "ready") return []
    return filterRows(tabData.rows, searchQuery)
  }, [tabData, searchQuery])

  const historyDisplayRows = useMemo(
    () => filterRows(historyRows, searchQuery),
    [historyRows, searchQuery],
  )

  const selectedCarriers = useMemo((): PickupCarrierKind[] => {
    if (tabData.tab !== "ready") return []
    return tabData.rows
      .filter((r) => selectedIds.has(r.id))
      .map((r) => r.pickupCarrier)
  }, [tabData, selectedIds])

  const toggleSelect = useCallback((id: string) => {
    setSelectedIds((prev) => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }, [])

  const toggleAll = useCallback(
    (checked: boolean) => {
      if (!checked) {
        setSelectedIds(new Set())
        return
      }
      setSelectedIds(new Set(readyRows.map((r) => r.id)))
    },
    [readyRows],
  )

  const openScheduleFlow = useCallback(() => {
    setSlotKey(null)
    setScheduleOpen(true)
  }, [])

  const handleScheduleContinue = useCallback(() => {
    setScheduleOpen(false)
    setConfirmOpen(true)
  }, [])

  const confirmSchedule = useCallback(async (): Promise<boolean> => {
    if (!pickupDate || !slotKey || selectedIds.size === 0) return false
    setIsScheduling(true)
    setError(null)
    try {
      const res = await fetch("/api/admin/shipping/pickups", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          orderIds: [...selectedIds],
          pickupDate: format(pickupDate, "yyyy-MM-dd"),
          slotKey,
          instructions,
        }),
      })
      const payload = await res.json()
      if (!res.ok) throw new Error(payload.error ?? "Schedule failed")

      void (payload as SchedulePickupsResponse)
      setScheduleOpen(false)
      setConfirmOpen(false)
      setSelectedIds(new Set())
      setInstructions("")
      setActiveTab("scheduled")
      await loadTab("scheduled", 0)
      return true
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Schedule failed")
      return false
    } finally {
      setIsScheduling(false)
    }
  }, [instructions, loadTab, pickupDate, selectedIds, slotKey])

  const loadMoreHistory = useCallback(() => {
    const nextOffset = historyOffset + 10
    void loadTab("history", nextOffset)
  }, [historyOffset, loadTab])

  return {
    activeTab,
    tabData,
    readyRows,
    historyDisplayRows,
    historyHasMore,
    isLoading,
    error,
    selectedIds,
    searchQuery,
    setSearchQuery,
    scheduleOpen,
    setScheduleOpen,
    confirmOpen,
    setConfirmOpen,
    pickupDate,
    setPickupDate,
    slotKey,
    setSlotKey,
    instructions,
    setInstructions,
    isScheduling,
    selectedCarriers,
    handleTabChange,
    toggleSelect,
    toggleAll,
    openScheduleFlow,
    handleScheduleContinue,
    confirmSchedule,
    loadMoreHistory,
  }
}
