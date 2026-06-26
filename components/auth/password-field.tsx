"use client"

import { useState, type ComponentProps, type ReactNode } from "react"
import { Eye, EyeOff } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { AuthField } from "@/components/auth/auth-field"
import { cn } from "@/lib/utils"

interface PasswordFieldProps extends ComponentProps<typeof Input> {
  label: string
  error?: string
  /** Extra content under the input (e.g. a strength meter). */
  children?: ReactNode
}

/**
 * Labeled password input with a show/hide toggle. Manages its own visibility
 * state and forwards remaining props (and the ref) to the input for
 * react-hook-form `register()`.
 */
export function PasswordField({
  label,
  error,
  children,
  className,
  ...inputProps
}: PasswordFieldProps) {
  const [show, setShow] = useState(false)

  return (
    <AuthField label={label} error={error}>
      <div className="relative">
        <Input
          type={show ? "text" : "password"}
          className={cn("h-11 pr-10", className)}
          {...inputProps}
        />
        <Button
          type="button"
          variant="ghost"
          size="icon-sm"
          onClick={() => setShow((v) => !v)}
          aria-label={show ? "Hide password" : "Show password"}
          className="text-muted-foreground absolute top-1/2 right-1.5 -translate-y-1/2"
        >
          {show ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
        </Button>
      </div>
      {children}
    </AuthField>
  )
}
