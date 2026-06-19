"use client"

import { Minus, Plus } from "lucide-react"
import { cn } from "@/lib/utils"

interface QtyStepperProps {
  value: number
  onIncrement: () => void
  onDecrement: () => void
  min?: number
  max?: number
}

export function QtyStepper({
  value,
  onIncrement,
  onDecrement,
  min = 1,
  max,
}: QtyStepperProps) {
  const atMin = value <= min
  const atMax = max !== undefined && value >= max

  return (
    <div className="border-border inline-flex h-9 items-center rounded-md border">
      <StepButton
        label="Decrease quantity"
        onClick={onDecrement}
        disabled={atMin}
      >
        <Minus className="h-3.5 w-3.5" strokeWidth={2} />
      </StepButton>
      <span className="text-foreground w-9 text-center text-sm font-medium tabular-nums">
        {value}
      </span>
      <StepButton
        label="Increase quantity"
        onClick={onIncrement}
        disabled={atMax}
      >
        <Plus className="h-3.5 w-3.5" strokeWidth={2} />
      </StepButton>
    </div>
  )
}

function StepButton({
  children,
  onClick,
  disabled,
  label,
}: {
  children: React.ReactNode
  onClick: () => void
  disabled?: boolean
  label: string
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      aria-label={label}
      className={cn(
        "text-foreground flex h-full w-9 items-center justify-center transition-colors",
        "hover:bg-muted disabled:text-muted-foreground/40 disabled:cursor-not-allowed disabled:hover:bg-transparent",
      )}
    >
      {children}
    </button>
  )
}
