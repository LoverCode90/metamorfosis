"use client"

import { Minus, Plus } from "lucide-react"

import { Button } from "@/components/ui/button"

interface ProductQuantityStepperProps {
  value: number
  min: number
  max: number
  disabled?: boolean
  onChange: (n: number) => void
}

/** Numeric quantity stepper bounded by `[min, max]`. */
export function ProductQuantityStepper({
  value,
  min,
  max,
  disabled,
  onChange,
}: ProductQuantityStepperProps) {
  return (
    <div className="border-border flex items-center rounded-md border">
      <Button
        type="button"
        variant="ghost"
        size="icon"
        onClick={() => onChange(Math.max(min, value - 1))}
        disabled={value <= min}
        aria-label="Decrease quantity"
      >
        <Minus className="h-4 w-4" strokeWidth={1.75} />
      </Button>
      <span className="text-foreground w-8 text-center text-sm font-semibold tabular-nums">
        {value}
      </span>
      <Button
        type="button"
        variant="ghost"
        size="icon"
        onClick={() => onChange(Math.min(max, value + 1))}
        disabled={disabled || value >= max}
        aria-label="Increase quantity"
      >
        <Plus className="h-4 w-4" strokeWidth={1.75} />
      </Button>
    </div>
  )
}
