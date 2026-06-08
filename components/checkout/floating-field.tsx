"use client"

import { useState, type InputHTMLAttributes } from "react"
import type { LucideIcon } from "lucide-react"
import { cn } from "@/lib/utils"

interface FloatingFieldProps extends InputHTMLAttributes<HTMLInputElement> {
  id: string
  label: string
  icon: LucideIcon
}

// A floating-label input with a fine bottom border only.
export function FloatingField({
  id,
  label,
  icon: Icon,
  className,
  ...props
}: FloatingFieldProps) {
  const [value, setValue] = useState("")
  const hasValue = value.length > 0

  return (
    <div className={cn("relative", className)}>
      <Icon
        className="pointer-events-none absolute left-0 top-3.5 h-4 w-4 text-muted-foreground"
        strokeWidth={1.75}
      />
      <input
        id={id}
        value={value}
        onChange={(e) => setValue(e.target.value)}
        placeholder=" "
        className={cn(
          "peer h-12 w-full border-b border-border bg-transparent pl-6 pr-2 pt-3 text-sm text-foreground",
          "outline-none transition-colors placeholder:text-transparent",
          "focus:border-foreground",
        )}
        {...props}
      />
      <label
        htmlFor={id}
        className={cn(
          "pointer-events-none absolute left-6 text-sm text-muted-foreground transition-all",
          hasValue
            ? "top-0 text-xs"
            : "top-3.5 peer-focus:top-0 peer-focus:text-xs",
        )}
      >
        {label}
      </label>
    </div>
  )
}
