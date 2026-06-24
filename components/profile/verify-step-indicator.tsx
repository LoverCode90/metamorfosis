"use client"

import { Check } from "lucide-react"
import { cn } from "@/lib/utils"

export function VerifyStepIndicator({ activeIndex }: { activeIndex: number }) {
  const STEPS = [
    { id: "info", label: "Information" },
    { id: "upload", label: "Upload license" },
    { id: "summary", label: "Summary" },
  ]
  return (
    <ol className="flex items-center gap-2 sm:gap-3">
      {STEPS.map((s, i) => {
        const done = i < activeIndex
        const active = i === activeIndex
        return (
          <li key={s.id} className="flex items-center gap-2 sm:gap-3">
            <span
              className={cn(
                "flex h-6 w-6 shrink-0 items-center justify-center rounded-md text-xs font-semibold transition-colors",
                done || active
                  ? "bg-foreground text-background"
                  : "border-border text-muted-foreground border",
              )}
            >
              {done ? <Check className="h-3.5 w-3.5" strokeWidth={3} /> : i + 1}
            </span>
            <span
              className={cn(
                "hidden text-sm font-medium sm:inline",
                active || done ? "text-foreground" : "text-muted-foreground",
              )}
            >
              {s.label}
            </span>
            {i < STEPS.length - 1 && (
              <span className="bg-border hidden h-px w-6 sm:inline-block" />
            )}
          </li>
        )
      })}
    </ol>
  )
}
