"use client"

import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

interface AddressFieldProps {
  id: string
  label: string
  value: string
  onChange: (v: string) => void
  autoComplete?: string
}

/** Labeled text field used within the shipping address form. */
export function AddressField({
  id,
  label,
  value,
  onChange,
  autoComplete,
}: AddressFieldProps) {
  return (
    <div>
      <Label htmlFor={id} className="text-muted-foreground mb-1.5 text-xs">
        {label}
      </Label>
      <Input
        id={id}
        type="text"
        value={value}
        autoComplete={autoComplete}
        onChange={(e) => onChange(e.target.value)}
        className="h-11"
      />
    </div>
  )
}
