"use client"

import { useState, type InputHTMLAttributes, type ReactNode } from "react"
import type { LucideIcon } from "lucide-react"
import { cn } from "@/lib/utils"

/* ── Wrapper mode (react-hook-form / step-info) ─────────────────────────── */

interface FloatingWrapperProps {
  label: string
  error?: string
  required?: boolean
  children: ReactNode
  id?: never
  icon?: never
}

/* ── Legacy self-managed mode (card-form.tsx) ────────────────────────────── */

interface FloatingLegacyProps extends InputHTMLAttributes<HTMLInputElement> {
  id: string
  label: string
  icon: LucideIcon
  error?: never
  children?: never
}

type FloatingFieldProps = FloatingWrapperProps | FloatingLegacyProps

export function FloatingField(props: FloatingFieldProps) {
  if ("children" in props && props.children !== undefined) {
    const { label, error, required, children } = props
    return (
      <div>
        <div className="relative">
          <label className="text-muted-foreground pointer-events-none absolute top-1.5 left-3 z-10 text-[10px] font-medium">
            {label}
            {required && <span className="text-destructive ml-0.5">*</span>}
          </label>
          {children}
        </div>
        {error && <p className="text-destructive mt-1 text-xs">{error}</p>}
      </div>
    )
  }

  return <FloatingFieldLegacy {...(props as FloatingLegacyProps)} />
}

function FloatingFieldLegacy({
  id,
  label,
  icon: Icon,
  className,
  ...rest
}: FloatingLegacyProps) {
  const [value, setValue] = useState("")
  const hasValue = value.length > 0

  return (
    <div className={cn("relative", className)}>
      <Icon
        className="text-muted-foreground pointer-events-none absolute top-3.5 left-0 h-4 w-4"
        strokeWidth={1.75}
      />
      <input
        id={id}
        value={value}
        onChange={(e) => setValue(e.target.value)}
        placeholder=" "
        className={cn(
          "peer border-border text-foreground h-12 w-full border-b bg-transparent pt-3 pr-2 pl-6 text-sm",
          "transition-colors outline-none placeholder:text-transparent",
          "focus:border-foreground",
        )}
        {...rest}
      />
      <label
        htmlFor={id}
        className={cn(
          "text-muted-foreground pointer-events-none absolute left-6 text-sm transition-all",
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
