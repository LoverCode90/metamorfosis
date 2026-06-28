/* eslint-disable @next/next/no-img-element */
"use client"

import { useState } from "react"
import { Check, ShoppingBag } from "lucide-react"
import { Button } from "@/components/ui/button"
import { formatUSD } from "@/lib/utils/format"
import { squareImageUrl } from "@/lib/utils/square-image"

interface StickyAddToCartBarProps {
  show: boolean
  name: string
  priceCents: number
  thumbnailUrl: string | null
  outOfStock: boolean
  onAdd: () => void
}

export function StickyAddToCartBar({
  show,
  name,
  priceCents,
  thumbnailUrl,
  outOfStock,
  onAdd,
}: StickyAddToCartBarProps) {
  const [succeeded, setSucceeded] = useState(false)

  function handleAdd() {
    onAdd()
    setSucceeded(true)
    setTimeout(() => setSucceeded(false), 1800)
  }

  if (!show) return null

  return (
    <div className="fixed right-0 bottom-0 left-0 z-50 flex justify-center px-4 pb-4">
      <div className="border-border bg-background/95 flex w-full max-w-lg items-center gap-3 rounded-2xl border p-3 shadow-xl backdrop-blur-sm">
        {thumbnailUrl && (
          <img
            src={squareImageUrl(thumbnailUrl, 80) ?? "/placeholder.svg"}
            alt={name}
            className="h-10 w-10 shrink-0 rounded-lg object-cover"
          />
        )}
        <div className="min-w-0 flex-1">
          <p className="text-foreground truncate text-sm font-medium">{name}</p>
          <p className="text-muted-foreground text-xs">
            {formatUSD(priceCents)}
          </p>
        </div>
        <Button
          size="sm"
          onClick={handleAdd}
          disabled={outOfStock || succeeded}
        >
          {succeeded ? (
            <>
              <Check className="h-4 w-4" strokeWidth={2.5} />
              Added!
            </>
          ) : (
            <>
              <ShoppingBag className="h-4 w-4" strokeWidth={1.75} />
              Add to Bag
            </>
          )}
        </Button>
      </div>
    </div>
  )
}
