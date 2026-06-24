"use client"

import { Package } from "lucide-react"
import { useRouter } from "next/navigation"

export function TrackingEmptyState() {
  const router = useRouter()

  return (
    <div className="border-border mt-10 flex flex-col items-center justify-center rounded-2xl border border-dashed py-20 text-center">
      <span className="bg-muted flex h-14 w-14 items-center justify-center rounded-full">
        <Package className="text-muted-foreground h-6 w-6" strokeWidth={1.5} />
      </span>
      <p className="text-foreground mt-5 text-base font-semibold">
        Order not found
      </p>
      <p className="text-muted-foreground mt-1.5 max-w-sm text-sm">
        We couldn&apos;t find this order. It may belong to a different account,
        or the link may have expired.
      </p>
      <button
        type="button"
        onClick={() => router.push("/orders")}
        className="bg-foreground text-background mt-6 inline-flex h-11 items-center rounded-md px-6 text-sm font-semibold transition-opacity hover:opacity-90"
      >
        View my orders
      </button>
    </div>
  )
}
