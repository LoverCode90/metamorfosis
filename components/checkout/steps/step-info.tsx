"use client"

import { useState, type FormEvent } from "react"
import { Mail, MapPin, User } from "lucide-react"

interface FieldState {
  value: string
  touched: boolean
}

function useField(initial = ""): [FieldState, (v: string) => void, () => void] {
  const [state, setState] = useState<FieldState>({
    value: initial,
    touched: false,
  })
  const set = (v: string) => setState({ value: v, touched: true })
  const touch = () => setState((s) => ({ ...s, touched: true }))
  return [state, set, touch]
}

function isValidEmail(v: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v.trim())
}

interface StepInfoProps {
  onContinue: (data: InfoData) => void
}

export interface InfoData {
  firstName: string
  lastName: string
  email: string
  address: string
}

export function StepInfo({ onContinue }: StepInfoProps) {
  const [firstName, setFirstName, touchFirstName] = useField()
  const [lastName, setLastName, touchLastName] = useField()
  const [email, setEmail, touchEmail] = useField()
  const [address, setAddress, touchAddress] = useField()

  const errors = {
    firstName: firstName.touched && !firstName.value.trim() ? "Required" : "",
    lastName: lastName.touched && !lastName.value.trim() ? "Required" : "",
    email:
      email.touched && !isValidEmail(email.value)
        ? email.value.trim()
          ? "Enter a valid email"
          : "Required"
        : "",
    address: address.touched && !address.value.trim() ? "Required" : "",
  }

  const isValid =
    firstName.value.trim() &&
    lastName.value.trim() &&
    isValidEmail(email.value) &&
    address.value.trim()

  function handleSubmit(e: FormEvent) {
    e.preventDefault()
    touchFirstName()
    touchLastName()
    touchEmail()
    touchAddress()
    if (!isValid) return
    onContinue({
      firstName: firstName.value.trim(),
      lastName: lastName.value.trim(),
      email: email.value.trim(),
      address: address.value.trim(),
    })
  }

  return (
    <form onSubmit={handleSubmit} noValidate className="space-y-8">
      <header className="space-y-1">
        <h2 className="text-foreground text-lg font-semibold tracking-tight">
          Contact Information
        </h2>
        <p className="text-muted-foreground text-sm">
          We&apos;ll use this to keep you updated on your order.
        </p>
      </header>

      <div className="space-y-6">
        <div className="grid grid-cols-2 gap-5">
          <ControlledField
            id="first-name"
            label="First name"
            icon={User}
            value={firstName.value}
            onChange={(v) => setFirstName(v)}
            onBlur={touchFirstName}
            error={errors.firstName}
            autoComplete="given-name"
          />
          <ControlledField
            id="last-name"
            label="Last name"
            icon={User}
            value={lastName.value}
            onChange={(v) => setLastName(v)}
            onBlur={touchLastName}
            error={errors.lastName}
            autoComplete="family-name"
          />
        </div>

        <ControlledField
          id="email"
          label="Email address"
          icon={Mail}
          type="email"
          value={email.value}
          onChange={(v) => setEmail(v)}
          onBlur={touchEmail}
          error={errors.email}
          autoComplete="email"
        />

        <ControlledField
          id="address"
          label="Shipping address"
          icon={MapPin}
          value={address.value}
          onChange={(v) => setAddress(v)}
          onBlur={touchAddress}
          error={errors.address}
          autoComplete="street-address"
        />
      </div>

      <button
        type="submit"
        className="bg-foreground text-background focus-visible:ring-ring h-12 w-full rounded-md text-sm font-semibold transition-opacity hover:opacity-90 focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-none"
      >
        Continue to Shipping
      </button>
    </form>
  )
}

// ---------------------------------------------------------------------------
// Controlled variant of FloatingField that accepts external value + callbacks
// and renders an inline error message.
// ---------------------------------------------------------------------------
import type { LucideIcon } from "lucide-react"
import { cn } from "@/lib/utils"

interface ControlledFieldProps {
  id: string
  label: string
  icon: LucideIcon
  value: string
  onChange: (v: string) => void
  onBlur: () => void
  error?: string
  type?: string
  inputMode?: React.InputHTMLAttributes<HTMLInputElement>["inputMode"]
  autoComplete?: string
  className?: string
}

function ControlledField({
  id,
  label,
  icon: Icon,
  value,
  onChange,
  onBlur,
  error,
  type = "text",
  inputMode,
  autoComplete,
  className,
}: ControlledFieldProps) {
  const hasValue = value.length > 0
  return (
    <div className={cn("relative", className)}>
      <Icon
        className="text-muted-foreground pointer-events-none absolute top-3.5 left-0 h-4 w-4"
        strokeWidth={1.75}
      />
      <input
        id={id}
        type={type}
        inputMode={inputMode}
        autoComplete={autoComplete}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onBlur={onBlur}
        placeholder=" "
        className={cn(
          "peer text-foreground h-12 w-full border-b bg-transparent pt-3 pr-2 pl-6 text-sm",
          "transition-colors outline-none placeholder:text-transparent",
          error
            ? "border-destructive"
            : "border-border focus:border-foreground",
        )}
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
      {error && <p className="text-destructive mt-1 text-xs">{error}</p>}
    </div>
  )
}
