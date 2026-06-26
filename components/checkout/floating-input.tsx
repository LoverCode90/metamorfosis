import * as React from "react"

import { FloatingField } from "@/components/checkout/floating-field"
import { Input } from "@/components/ui/input"
import { cn } from "@/lib/utils"

interface FloatingInputProps extends React.ComponentProps<typeof Input> {
  label: string
  error?: string
  required?: boolean
}

/**
 * Floating-label text input composing {@link FloatingField} + the shadcn
 * {@link Input}. Spreads remaining props (and the ref) onto the input so it
 * wires directly with react-hook-form `register()`.
 */
export function FloatingInput({
  label,
  error,
  required,
  className,
  ...props
}: FloatingInputProps) {
  return (
    <FloatingField label={label} error={error} required={required}>
      <Input
        placeholder={label}
        className={cn(
          "h-12 pt-5 pb-1.5 placeholder:text-transparent",
          className,
        )}
        {...props}
      />
    </FloatingField>
  )
}
