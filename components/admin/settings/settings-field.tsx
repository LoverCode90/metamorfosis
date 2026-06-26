import type { ReactNode } from "react"

import { Label } from "@/components/ui/label"

interface SettingsFieldProps {
  label: string
  children: ReactNode
}

/** Uppercase-label field wrapper used across the admin settings forms. */
export function SettingsField({ label, children }: SettingsFieldProps) {
  return (
    <div className="flex flex-col gap-1.5">
      <Label className="text-muted-foreground text-xs font-medium tracking-wide uppercase">
        {label}
      </Label>
      {children}
    </div>
  )
}
