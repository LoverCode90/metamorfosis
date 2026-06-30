"use client"

import { useIsMobile } from "@/hooks/use-mobile"
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet"
import { VerificationDetail } from "@/components/admin/verification-detail"
import type { VerificationRow } from "@/lib/admin/verifications"

interface VerificationDetailSheetProps {
  item: VerificationRow | null
  onClose: () => void
  onApprove: (id: string) => Promise<void>
  onReject: (id: string, reason: string) => Promise<void>
}

/** Bottom sheet for verification detail on mobile only (avoids desktop overlay bug). */
export function VerificationDetailSheet({
  item,
  onClose,
  onApprove,
  onReject,
}: VerificationDetailSheetProps) {
  const isMobile = useIsMobile()

  if (!isMobile) return null

  return (
    <Sheet open={Boolean(item)} onOpenChange={(open) => !open && onClose()}>
      <SheetContent
        side="bottom"
        className="flex h-[92dvh] flex-col rounded-t-2xl p-0"
      >
        <SheetHeader className="border-border shrink-0 border-b px-4 py-3">
          <SheetTitle>Verification detail</SheetTitle>
        </SheetHeader>
        <div className="min-h-0 flex-1 overflow-y-auto">
          {item && (
            <VerificationDetail
              item={item}
              onApprove={onApprove}
              onReject={onReject}
            />
          )}
        </div>
      </SheetContent>
    </Sheet>
  )
}
