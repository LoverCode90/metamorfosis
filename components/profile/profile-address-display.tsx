"use client"

import { useRouter } from "next/navigation"
import { Trash2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import type { SavedAddress } from "@/lib/types"
import { formatPhone } from "@/lib/utils/phone"

interface ProfileAddressDisplayProps {
  savedAddress: SavedAddress
  fromCheckout?: boolean
  step?: string | null
  onDeleteClick: () => void
}

export function ProfileAddressDisplay({
  savedAddress,
  fromCheckout,
  step,
  onDeleteClick,
}: ProfileAddressDisplayProps) {
  const router = useRouter()

  return (
    <>
      <address className="text-muted-foreground mt-4 flex flex-col gap-1 text-sm not-italic">
        <span className="text-foreground font-medium">
          {savedAddress.fullName}
        </span>
        {savedAddress.phone && <span>{formatPhone(savedAddress.phone)}</span>}
        <span>{savedAddress.line1}</span>
        <span>
          {savedAddress.city}, {savedAddress.region} {savedAddress.postalCode}
        </span>
        <span>United States</span>
      </address>
      <div className="flex flex-col gap-2 pt-4">
        {fromCheckout && (
          <Button
            variant="default"
            size="hero"
            className="w-full font-semibold"
            onClick={() => router.push(`/checkout?step=${step ?? "info"}`)}
          >
            Return to Checkout
          </Button>
        )}
        <Button
          variant="ghost"
          size="sm"
          className="text-destructive hover:text-destructive h-7 self-start px-2 text-xs"
          onClick={onDeleteClick}
        >
          <Trash2 className="mr-1 h-3.5 w-3.5" />
          Delete address
        </Button>
      </div>
    </>
  )
}
