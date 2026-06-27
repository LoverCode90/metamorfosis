import type { ReactNode } from "react"

import { Label } from "@/components/ui/label"

interface AddressFieldGroupProps {
  label: string
  children: ReactNode
  className?: string
  error?: string
}

/** Labeled field wrapper for the profile address form (label + control). */
export function AddressFieldGroup({
  label,
  children,
  className,
  error,
}: AddressFieldGroupProps) {
  return (
    <div className={className}>
      <Label className="text-muted-foreground mb-1 text-xs">{label}</Label>
      {children}
      {error && <p className="text-destructive mt-1 text-xs">{error}</p>}
    </div>
  )
}
