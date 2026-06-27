"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { ChevronLeft, Package } from "lucide-react"
import { useRouter } from "next/navigation"

import { Button } from "@/components/ui/button"
import { OrderRow } from "@/components/profile/order-row"
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
  orders: DbOrder[]
}

/** List of the user's orders, or an empty state. */
export function OrdersList({ orders }: OrdersListProps) {
  // Read the client clock only after mount so the cancellation window does not
  // cause an SSR/client hydration mismatch.
  const [now, setNow] = useState<number | null>(null)
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
    </div>
  )
}
