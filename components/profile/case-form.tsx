"use client"

import { Loader2 } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { NativeSelect } from "@/components/ui/native-select"
import { Textarea } from "@/components/ui/textarea"
import { CasePhotoUpload } from "@/components/profile/case-photo-upload"
import { useCaseForm } from "@/hooks/use-case-form"
import type { DbOrder } from "@/lib/orders/types"

/**
 * Customer "report a problem" form for an order: pick an item and reason,
 * describe the issue, and attach optional photos. State lives in
 * {@link useCaseForm}.
 */
export function CaseForm({ order }: { order: DbOrder }) {
  const f = useCaseForm(order)

  return (
    <form onSubmit={f.submit} className="mx-auto max-w-2xl space-y-6 py-8">
      <div>
        <h2 className="text-foreground text-2xl font-semibold tracking-tight">
          Report a Problem
        </h2>
        <p className="text-muted-foreground mt-1 text-sm">
          Select an item and provide details. We&apos;ll help you resolve this
          issue.
        </p>
      </div>

      {f.error && (
        <div className="bg-destructive/10 text-destructive rounded-md p-3 text-sm font-medium">
          {f.error}
        </div>
      )}

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
                {item.quantity}x {item.product_variations?.name_en ?? "Item"}
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

        <div className="space-y-2">
          <Label>Photos (Optional, max 3)</Label>
          <CasePhotoUpload
            files={f.files}
            max={f.maxPhotos}
            onSelect={f.addFiles}
            onRemove={f.removeFile}
          />
        </div>
      </div>

      <Button type="submit" className="w-full" disabled={!f.canSubmit}>
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
