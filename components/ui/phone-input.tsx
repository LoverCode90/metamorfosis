"use client"

import { useState } from "react"
import {
  digits,
  formatPhone,
  phoneErrorMessage,
  validatePhone,
} from "@/lib/utils/phone"
import { cn } from "@/lib/utils"

interface Props {
  value: string
  onChange: (digitsOnly: string) => void
  placeholder?: string
  className?: string
  /** When false, the inline error is suppressed (e.g. before first blur). */
  showError?: boolean
  required?: boolean
  id?: string
  name?: string
}

/**
 * US-continental phone input. Auto-formats to "(555) 555-5555" as the user
 * types and emits the raw 10-digit string via `onChange`. Blocks Hawaii (808)
 * and Alaska (907). Shows an inline error after blur or when `showError` is
 * forced.
 */
export function PhoneInput({
  value,
  onChange,
  placeholder = "(555) 555-5555",
  className,
  showError,
  required,
  id,
  name,
}: Props) {
  const [touched, setTouched] = useState(false)
  const display = formatPhone(value)
  const err = value ? validatePhone(value) : null
  const visibleError = (showError ?? touched) && err

  return (
    <div className="flex flex-col gap-1">
      <input
        id={id}
        name={name}
        required={required}
        type="tel"
        inputMode="tel"
        autoComplete="tel-national"
        placeholder={placeholder}
        value={display}
        onChange={(e) => onChange(digits(e.target.value))}
        onBlur={() => setTouched(true)}
        className={cn(
          "border-border bg-background text-foreground placeholder:text-muted-foreground focus:border-foreground h-11 w-full rounded-md border px-3 text-sm transition-colors outline-none",
          visibleError && "border-destructive",
          className,
        )}
      />
      {visibleError && (
        <p className="text-destructive text-xs">{phoneErrorMessage(err)}</p>
      )}
    </div>
  )
}
