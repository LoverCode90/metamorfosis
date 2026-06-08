"use client"

import { useState } from "react"
import { Check, Package, Truck, Zap } from "lucide-react"
import type { InfoData } from "./step-info"
import { cn } from "@/lib/utils"

export interface ShippingMethod {
  id: string
  label: string
  description: string
  price: string
  eta: string
  icon: typeof Truck
}

const METHODS: ShippingMethod[] = [
  {
    id: "free",
    label: "Standard Shipping",
    description: "Tracked delivery via USPS",
    price: "Free",
    eta: "5–7 business days",
    icon: Truck,
  },
  {
    id: "express",
    label: "Express Shipping",
    description: "Priority handling + tracking",
    price: "$12.00",
    eta: "2–3 business days",
    icon: Zap,
  },
  {
    id: "overnight",
    label: "Overnight",
    description: "Next-day guaranteed by 12 PM",
    price: "$28.00",
    eta: "Next business day",
    icon: Package,
  },
]

interface StepShippingProps {
  info: InfoData
  onContinue: (method: ShippingMethod) => void
  onBack: () => void
}

export function StepShipping({ info, onContinue, onBack }: StepShippingProps) {
  const [selected, setSelected] = useState(METHODS[0].id)

  function handleContinue() {
    const method = METHODS.find((m) => m.id === selected)!
    onContinue(method)
  }

  return (
    <div className="space-y-8">
      <header className="space-y-1">
        <h2 className="text-lg font-semibold tracking-tight text-foreground">
          Shipping Method
        </h2>
        <p className="text-sm text-muted-foreground">
          Delivering to <span className="font-medium text-foreground">{info.address}</span>
        </p>
      </header>

      {/* Summary row */}
      <div className="divide-y divide-border rounded-lg border border-border">
        <SummaryRow label="Contact" value={info.email} />
        <SummaryRow label="Ship to" value={`${info.firstName} ${info.lastName} · ${info.address}`} />
      </div>

      {/* Method selector */}
      <fieldset className="space-y-3">
        <legend className="sr-only">Choose a shipping method</legend>
        {METHODS.map((method) => {
          const Icon = method.icon
          const isSelected = selected === method.id
          return (
            <label
              key={method.id}
              htmlFor={`ship-${method.id}`}
              className={cn(
                "flex cursor-pointer items-center gap-4 rounded-lg border p-4 transition-colors",
                isSelected
                  ? "border-foreground bg-foreground/[0.03]"
                  : "border-border hover:border-foreground/40",
              )}
            >
              <input
                id={`ship-${method.id}`}
                type="radio"
                name="shipping-method"
                value={method.id}
                checked={isSelected}
                onChange={() => setSelected(method.id)}
                className="sr-only"
              />

              {/* Custom radio ring */}
              <span
                className={cn(
                  "flex h-5 w-5 shrink-0 items-center justify-center rounded-full border-2 transition-colors",
                  isSelected ? "border-foreground bg-foreground" : "border-border",
                )}
              >
                {isSelected && <Check className="h-3 w-3 text-background" strokeWidth={3} />}
              </span>

              <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-md border border-border bg-muted/40">
                <Icon className="h-4 w-4 text-foreground" strokeWidth={1.75} />
              </span>

              <span className="flex-1">
                <span className="block text-sm font-medium text-foreground">{method.label}</span>
                <span className="block text-xs text-muted-foreground">
                  {method.description} · {method.eta}
                </span>
              </span>

              <span
                className={cn(
                  "text-sm font-semibold tabular-nums",
                  method.id === "free" ? "text-emerald-600" : "text-foreground",
                )}
              >
                {method.price}
              </span>
            </label>
          )
        })}
      </fieldset>

      <div className="flex flex-col gap-3 sm:flex-row-reverse">
        <button
          type="button"
          onClick={handleContinue}
          className="h-12 flex-1 rounded-md bg-foreground text-sm font-semibold text-background transition-opacity hover:opacity-90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
        >
          Continue to Payment
        </button>
        <button
          type="button"
          onClick={onBack}
          className="h-12 flex-1 rounded-md border border-border text-sm font-medium text-muted-foreground transition-colors hover:border-foreground/40 hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
        >
          Back to Information
        </button>
      </div>
    </div>
  )
}

function SummaryRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-start gap-4 px-4 py-3">
      <span className="w-20 shrink-0 text-xs font-medium text-muted-foreground">
        {label}
      </span>
      <span className="text-sm text-foreground">{value}</span>
    </div>
  )
}
