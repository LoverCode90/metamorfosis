"use client"

import { CheckCircle, Pencil } from "lucide-react"

import { Button } from "@/components/ui/button"
import type { CheckoutAddress } from "@/lib/checkout/types"

interface SavedAddressBannerProps {
  address: CheckoutAddress
  onEdit: () => void
}

/**
 * Banner shown when a saved default address is pre-filling the form,
 * summarizing it and exposing an "Edit" affordance to unlock manual entry.
 */
export function SavedAddressBanner({
  address,
  onEdit,
}: SavedAddressBannerProps) {
  const line2 = address.streetLine2 ? `, ${address.streetLine2}` : ""

  return (
    <div className="border-border bg-muted/40 flex items-start justify-between gap-3 rounded-lg border p-4">
      <div className="flex items-start gap-3">
        <CheckCircle
          className="mt-0.5 h-4 w-4 shrink-0 text-green-500"
          strokeWidth={1.75}
        />
        <div>
          <p className="text-foreground text-sm font-medium">
            Using saved address
          </p>
          <p className="text-muted-foreground text-xs">
            {address.streetLine1}
            {line2} — {address.city}, {address.state} {address.zip}
          </p>
        </div>
      </div>
      <Button
        type="button"
        variant="ghost"
        size="sm"
        onClick={onEdit}
        className="text-muted-foreground shrink-0"
      >
        <Pencil className="h-3 w-3" strokeWidth={2} />
        Edit
      </Button>
    </div>
  )
}
