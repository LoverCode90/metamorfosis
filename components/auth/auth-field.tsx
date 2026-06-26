import type { ReactNode } from "react"

import { Label } from "@/components/ui/label"

interface AuthFieldProps {
  label: string
  error?: string
  children: ReactNode
}

/** Auth form field: a label, the control, and an optional error message. */
export function AuthField({ label, error, children }: AuthFieldProps) {
  return (
    <div className="flex flex-col gap-1.5">
      <Label className="text-foreground text-sm font-medium">{label}</Label>
      {children}
      {error && <p className="text-destructive text-xs">{error}</p>}
    </div>
  )
}
