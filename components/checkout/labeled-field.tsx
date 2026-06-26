import type { ReactNode } from "react"

import { Label } from "@/components/ui/label"

interface LabeledFieldProps {
  label: string
  required?: boolean
  error?: string
  children: ReactNode
}

/**
 * Top-aligned field wrapper: a {@link Label}, the control (children), and an
 * optional error message. Use for controls that don't use a floating label
 * (selects, phone input, read-only displays).
 */
export function LabeledField({
  label,
  required,
  error,
  children,
}: LabeledFieldProps) {
  return (
    <div>
      <Label className="text-muted-foreground mb-1 text-xs font-medium">
        {label}
        {required && <span className="text-destructive ml-0.5">*</span>}
      </Label>
      {children}
      {error && <p className="text-destructive mt-1 text-xs">{error}</p>}
    </div>
  )
}
