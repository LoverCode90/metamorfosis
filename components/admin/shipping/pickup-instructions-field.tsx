"use client"

import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"

interface PickupInstructionsFieldProps {
  value: string
  disabled: boolean
  onChange: (value: string) => void
}

/** Optional courier instructions (gate code, back door, etc.). */
export function PickupInstructionsField({
  value,
  disabled,
  onChange,
}: PickupInstructionsFieldProps) {
  return (
    <div className="space-y-2">
      <Label htmlFor="pickup-instructions">
        Instructions for the carrier (optional)
      </Label>
      <Textarea
        id="pickup-instructions"
        value={value}
        disabled={disabled}
        onChange={(event) => onChange(event.target.value)}
        placeholder="e.g. Ring bell at front door. Packages are behind the counter."
        rows={3}
        maxLength={500}
      />
      <p className="text-muted-foreground text-xs">
        Shown to USPS or DHL when they arrive at the store.
      </p>
    </div>
  )
}
