"use client"

import { Loader2 } from "lucide-react"
import { useCallback, useEffect, useRef, useState } from "react"

import { StorePickupRow } from "@/components/admin/store-pickups/store-pickup-row"
import { AdminSurfaceCard } from "@/components/admin/ui/admin-surface-card"
import { Button } from "@/components/ui/button"
import { fetchStorePickupsPage } from "@/lib/admin/store-pickups-api"
import type {
  StorePickupHistoryOrder,
  StorePickupTab,
} from "@/lib/admin/store-pickup-types"

interface StorePickupListProps {
  tab: StorePickupTab
  initialOrders: StorePickupHistoryOrder[]
  initialNextCursor: string | null
}

const EMPTY_COPY: Record<
  StorePickupTab,
  { title: string; description: string }
> = {
  pending: {
    title: "No customers waiting",
    description:
      "When someone orders for store pickup, their order will show up here with a ticket number.",
  },
  canceled: {
    title: "No canceled pickups",
    description:
      "Canceled or expired pickup orders will appear here when they exist.",
  },
  history: {
    title: "No pickup history yet",
    description:
      "Completed and canceled store pickups will show up here as activity happens.",
  },
}

export function StorePickupList({
  tab,
  initialOrders,
  initialNextCursor,
}: StorePickupListProps) {
  const [orders, setOrders] = useState<StorePickupHistoryOrder[]>(initialOrders)
  const [nextCursor, setNextCursor] = useState<string | null>(initialNextCursor)
  const [loadingMore, setLoadingMore] = useState(false)
  const [expandedId, setExpandedId] = useState<string | null>(null)
  const listRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setOrders(initialOrders)
    setNextCursor(initialNextCursor)
    setExpandedId(null)
  }, [tab, initialOrders, initialNextCursor])

  useEffect(() => {
    function handlePointerDown(event: PointerEvent) {
      if (!expandedId) return
      const target = event.target
      if (!(target instanceof Node)) return
      if (listRef.current?.contains(target)) return
      setExpandedId(null)
    }

    document.addEventListener("pointerdown", handlePointerDown)
    return () => document.removeEventListener("pointerdown", handlePointerDown)
  }, [expandedId])

  const mode = tab === "pending" ? "pending" : "history"

  const isLarge = useCallback(
    (orderId: string, index: number) => {
      if (expandedId) return orderId === expandedId
      return index === 0
    },
    [expandedId],
  )

  const loadMore = useCallback(async () => {
    if (!nextCursor || loadingMore) return
    setLoadingMore(true)
    try {
      const page = await fetchStorePickupsPage(tab, nextCursor)
      setOrders((prev) => [...prev, ...page.items])
      setNextCursor(page.nextCursor)
    } finally {
      setLoadingMore(false)
    }
  }, [loadingMore, nextCursor, tab])

  if (orders.length === 0) {
    const copy = EMPTY_COPY[tab]
    return (
      <AdminSurfaceCard title={copy.title}>
        <p className="text-muted-foreground text-base leading-relaxed">
          {copy.description}
        </p>
      </AdminSurfaceCard>
    )
  }

  return (
    <div ref={listRef} className="space-y-3">
      {orders.length > 1 && (
        <div className="text-muted-foreground hidden px-1 text-xs font-medium tracking-wide uppercase sm:grid sm:grid-cols-[minmax(0,1.1fr)_minmax(0,1.4fr)_minmax(0,1fr)_auto_auto] sm:gap-3 sm:px-5">
          <span>Ticket</span>
          <span>Customer</span>
          <span>{tab === "pending" ? "Ordered" : "Activity"}</span>
          <span>Status</span>
          <span>Total</span>
        </div>
      )}

      {orders.map((order, index) => {
        const large = isLarge(order.id, index)

        if (large) {
          return (
            <StorePickupRow
              key={order.id}
              order={order}
              mode={mode}
              variant="full"
            />
          )
        }

        return (
          <StorePickupRow
            key={order.id}
            order={order}
            mode={mode}
            variant="compact"
            onExpand={() => setExpandedId(order.id)}
          />
        )
      })}

      {nextCursor && (
        <div className="flex justify-center pt-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => void loadMore()}
            disabled={loadingMore}
            className="gap-2"
          >
            {loadingMore && <Loader2 className="h-4 w-4 animate-spin" />}
            {loadingMore ? "Loading..." : "See more"}
          </Button>
        </div>
      )}
    </div>
  )
}
