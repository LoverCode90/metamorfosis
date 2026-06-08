"use client"

import { useState, type FormEvent } from "react"
import { Mail, MapPin, Phone, User } from "lucide-react"
import { FloatingField } from "../floating-field"

interface FieldState {
  value: string
  touched: boolean
}

function useField(initial = ""): [FieldState, (v: string) => void, () => void] {
  const [state, setState] = useState<FieldState>({ value: initial, touched: false })
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
  phone: string
  address: string
}

export function StepInfo({ onContinue }: StepInfoProps) {
  const [firstName, setFirstName, touchFirstName] = useField()
  const [lastName, setLastName, touchLastName] = useField()
  const [email, setEmail, touchEmail] = useField()
  const [phone, setPhone, touchPhone] = useField()
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
    phone: phone.touched && !phone.value.trim() ? "Required" : "",
    address: address.touched && !address.value.trim() ? "Required" : "",
  }

  const isValid =
    firstName.value.trim() &&
    lastName.value.trim() &&
    isValidEmail(email.value) &&
    phone.value.trim() &&
    address.value.trim()

  function handleSubmit(e: FormEvent) {
    e.preventDefault()
    touchFirstName()
    touchLastName()
    touchEmail()
    touchPhone()
    touchAddress()
    if (!isValid) return
    onContinue({
      firstName: firstName.value.trim(),
      lastName: lastName.value.trim(),
      email: email.value.trim(),
      phone: phone.value.trim(),
      address: address.value.trim(),
    })
  }

  return (
    <form onSubmit={handleSubmit} noValidate className="space-y-8">
      <header className="space-y-1">
        <h2 className="text-lg font-semibold tracking-tight text-foreground">
          Contact Information
        </h2>
        <p className="text-sm text-muted-foreground">
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
          id="phone"
          label="Phone number"
          icon={Phone}
          type="tel"
          inputMode="tel"
          value={phone.value}
          onChange={(v) => setPhone(v)}
          onBlur={touchPhone}
          error={errors.phone}
          autoComplete="tel"
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
        className="h-12 w-full rounded-md bg-foreground text-sm font-semibold text-background transition-opacity hover:opacity-90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
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
        className="pointer-events-none absolute left-0 top-3.5 h-4 w-4 text-muted-foreground"
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
          "peer h-12 w-full border-b bg-transparent pl-6 pr-2 pt-3 text-sm text-foreground",
          "outline-none transition-colors placeholder:text-transparent",
          error ? "border-destructive" : "border-border focus:border-foreground",
        )}
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
      {error && (
        <p className="mt-1 text-xs text-destructive">{error}</p>
      )}
    </div>
  )
}
