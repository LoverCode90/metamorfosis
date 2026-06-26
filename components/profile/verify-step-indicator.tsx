"use client"

import { Check } from "lucide-react"

import { cn } from "@/lib/utils"

const STEPS = [
  { id: "info", label: "Information" },
  { id: "upload", label: "Upload license" },
  { id: "summary", label: "Summary" },
]

/** Horizontal step indicator for the verification wizard. */
export function VerifyStepIndicator({ activeIndex }: { activeIndex: number }) {
  return (
    <ol className="flex items-center gap-2 sm:gap-3">
      {STEPS.map((step, stepIndex) => {
        const done = stepIndex < activeIndex
        const active = stepIndex === activeIndex
        const badgeClass = cn(
          "flex h-6 w-6 shrink-0 items-center justify-center rounded-md text-xs font-semibold transition-colors",
          done || active
            ? "bg-foreground text-background"
            : "border-border text-muted-foreground border",
        )
        const labelClass = cn(
          "hidden text-sm font-medium sm:inline",
          active || done ? "text-foreground" : "text-muted-foreground",
        )

        return (
          <li key={step.id} className="flex items-center gap-2 sm:gap-3">
            <span className={badgeClass}>
              {done ? (
                <Check className="h-3.5 w-3.5" strokeWidth={3} />
              ) : (
                stepIndex + 1
              )}
            </span>
            <span className={labelClass}>{step.label}</span>
            {stepIndex < STEPS.length - 1 && (
              <span className="bg-border hidden h-px w-6 sm:inline-block" />
            )}
          </li>
        )
      })}
    </ol>
  )
}
