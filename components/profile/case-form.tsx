"use client"

import { Loader2 } from "lucide-react"

import { Button } from "@/components/ui/button"
import { FloatingToast } from "@/components/ui/floating-toast"
import { Label } from "@/components/ui/label"
import { NativeSelect } from "@/components/ui/native-select"
import { Textarea } from "@/components/ui/textarea"
import { CasePhotoUpload } from "@/components/profile/case-photo-upload"
import { useCaseForm } from "@/hooks/use-case-form"
import { itemLabel } from "@/lib/orders/item-label"
import { CONDITION_OPTIONS } from "@/lib/profile/case-reasons"
import { cn } from "@/lib/utils"
import type { DbOrder } from "@/lib/orders/types"

/**
 * Customer "report a problem" form for an order: pick an item and reason,
 * describe the issue, and attach optional photos. State lives in
 * {@link useCaseForm}.
 */
export function CaseForm({ order }: { order: DbOrder }) {
  const f = useCaseForm(order)

  return (
    <form
      onSubmit={f.submit}
      noValidate
      className="mx-auto max-w-2xl space-y-6 overflow-hidden px-4 pt-8 pb-24 md:px-0 md:pb-8"
    >
      <div>
        <h2 className="text-foreground text-2xl font-semibold tracking-tight">
          Report a Problem
        </h2>
        <p className="text-muted-foreground mt-1 text-sm">
          Select an item and provide details. We&apos;ll help you resolve this
          issue.
        </p>
      </div>

      <FloatingToast message={f.toast || null} onClose={f.dismissToast} />

      <div className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="variationId">Which item?</Label>
          <NativeSelect
            id="variationId"
            value={f.variationId}
            onChange={(e) => f.selectVariation(e.target.value)}
            required
          >
            {order.order_items.map((item) => (
              <option key={item.id} value={item.variation_id}>
                {item.quantity}x{" "}
                {itemLabel(
                  item.product_variations?.product_translations?.name_en,
                  item.product_variations?.name_en,
                )}
              </option>
            ))}
          </NativeSelect>
        </div>

        <div className="space-y-2">
          <Label htmlFor="reason">Reason</Label>
          <NativeSelect
            id="reason"
            value={f.reason}
            onChange={(e) => f.setReason(e.target.value)}
            required
          >
            {f.availableReasons.map((r) => (
              <option key={r.value} value={r.value}>
                {r.label}
              </option>
            ))}
          </NativeSelect>
        </div>

        <div className="space-y-2">
          <Label htmlFor="explanation">
            Explanation (minimum 40 characters)
          </Label>
          <Textarea
            id="explanation"
            value={f.explanation}
            onChange={(e) => f.setExplanation(e.target.value)}
            placeholder="Please describe the issue in detail..."
            minLength={40}
            required
          />
          <p className="text-muted-foreground text-right text-xs">
            {f.explanation.length} / 40
          </p>
        </div>

        {f.requireCondition && (
          <div className="space-y-2">
            <Label htmlFor="condition">Item condition</Label>
            <NativeSelect
              id="condition"
              value={f.condition}
              onChange={(e) => f.setCondition(e.target.value)}
              required
            >
              <option value="">Select condition</option>
              {CONDITION_OPTIONS.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </NativeSelect>
          </div>
        )}

        <div className="space-y-2">
          <Label>Photos (required)</Label>
          <CasePhotoUpload
            files={f.files}
            max={f.maxPhotos}
            onSelect={f.addFiles}
            onRemove={f.removeFile}
          />
          <p className="text-muted-foreground text-xs">
            Clear photos of the item are required to process your return. The
            owner may reject cases without adequate photos.
          </p>
        </div>
      </div>

      <p className="text-muted-foreground text-xs">
        Items under $15.00 cannot be returned due to shipping logistics, as
        stated in our Terms &amp; Conditions.
      </p>

      <Button
        type="submit"
        className={cn(
          "w-full",
          !f.canSubmit && "cursor-not-allowed opacity-50",
        )}
      >
        {f.isSubmitting ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Submitting...
          </>
        ) : (
          "Submit Case"
        )}
      </Button>
    </form>
  )
}
