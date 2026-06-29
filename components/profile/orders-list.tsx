"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { ChevronLeft, Loader2, Package } from "lucide-react"
import { useRouter } from "next/navigation"

import { Button } from "@/components/ui/button"
import { OrderRow } from "@/components/profile/order-row"
import { useOrdersPagination } from "@/hooks/use-orders-pagination"
import type { DbOrder } from "@/lib/orders/types"

export function OrdersBackButton() {
  const router = useRouter()
  return (
    <Button
      variant="ghost"
      size="sm"
      onClick={() => router.back()}
      className="text-muted-foreground hover:text-foreground -ml-2 gap-1"
    >
      <ChevronLeft className="h-4 w-4" />
      Back
    </Button>
  )
}

interface OrdersListProps {
  initialOrders: DbOrder[]
  hasMore: boolean
}

export function OrdersList({
  initialOrders,
  hasMore: initialHasMore,
}: OrdersListProps) {
  const [now, setNow] = useState<number | null>(null)
  const { orders, hasMore, loading, loadMore } = useOrdersPagination(
    initialOrders,
    initialHasMore,
  )

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setNow(Date.now())
  }, [])

  if (orders.length === 0) {
    return (
      <div className="border-border flex flex-col items-center justify-center rounded-2xl border border-dashed py-20 text-center">
        <span className="bg-muted flex h-14 w-14 items-center justify-center rounded-full">
          <Package
            className="text-muted-foreground h-6 w-6"
            strokeWidth={1.5}
          />
        </span>
        <p className="text-foreground mt-5 text-base font-semibold">
          No orders yet
        </p>
        <p className="text-muted-foreground mt-1.5 max-w-sm text-sm">
          Once you place an order, it will appear here.
        </p>
        <Button
          variant="default"
          size="cta"
          nativeButton={false}
          className="mt-6"
          render={<Link href="/products" />}
        >
          Start shopping
        </Button>
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-4">
      {orders.map((order) => (
        <OrderRow key={order.id} order={order} now={now} />
      ))}
      {hasMore && (
        <div className="flex justify-center pt-2">
          <Button
            variant="outline"
            size="sm"
            onClick={loadMore}
            disabled={loading}
            className="gap-2"
          >
            {loading && <Loader2 className="h-4 w-4 animate-spin" />}
            {loading ? "Loading..." : "See more"}
          </Button>
        </div>
      )}
    </div>
  )
}
