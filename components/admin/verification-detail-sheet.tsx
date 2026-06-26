"use client"

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

/** Full-height bottom sheet wrapping the verification detail on small screens. */
export function VerificationDetailSheet({
  item,
  onClose,
  onApprove,
  onReject,
}: VerificationDetailSheetProps) {
  return (
    <Sheet open={Boolean(item)} onOpenChange={(open) => !open && onClose()}>
      <SheetContent
        side="bottom"
        className="h-[92dvh] rounded-t-2xl p-0 lg:hidden"
      >
        <SheetHeader className="border-border border-b">
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
