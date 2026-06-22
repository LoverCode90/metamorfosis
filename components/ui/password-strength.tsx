"use client"

import { Check, X } from "lucide-react"
import { cn } from "@/lib/utils"
import { PasswordRules, passwordScore } from "@/lib/validation/schemas"

const STRENGTH_LABELS: Record<1 | 2 | 3, string> = {
  1: "Weak",
  2: "Medium",
  3: "Strong",
}

const STRENGTH_COLORS: Record<1 | 2 | 3, string> = {
  1: "text-red-500",
  2: "text-amber-500",
  3: "text-emerald-500",
}

export function PasswordStrength({ password }: { password: string }) {
  const score = passwordScore(password)
  const rules = [
    { label: "At least 8 characters", ok: PasswordRules.length(password) },
    { label: "One uppercase letter", ok: PasswordRules.upper(password) },
    { label: "One number", ok: PasswordRules.number(password) },
    { label: "One special (!@#$%^&*)", ok: PasswordRules.special(password) },
  ]

  const barColor =
    score === 1
      ? "bg-red-500"
      : score === 2
        ? "bg-amber-500"
        : score === 3
          ? "bg-emerald-500"
          : "bg-muted"

  return (
    <div className="mt-2 flex flex-col gap-2">
      <div className="flex items-center gap-2">
        <div className="flex h-1 flex-1 gap-1.5" aria-hidden>
          {[1, 2, 3].map((seg) => {
            const reached = score >= seg
            return (
              <span
                key={seg}
                className={cn(
                  "h-full flex-1 rounded-full transition-[background-color,opacity] duration-300 ease-out",
                  reached ? barColor : "bg-muted",
                  reached ? "opacity-100" : "opacity-60",
                )}
              />
            )
          })}
        </div>
        {password.length > 0 && score > 0 && (
          <span
            className={cn(
              "shrink-0 text-xs font-medium",
              STRENGTH_COLORS[score as 1 | 2 | 3],
            )}
          >
            {STRENGTH_LABELS[score as 1 | 2 | 3]}
          </span>
        )}
      </div>
      {password.length > 0 && (
        <ul className="text-muted-foreground flex flex-col gap-0.5 text-xs">
          {rules.map((r) => (
            <li
              key={r.label}
              className={cn(
                "flex items-center gap-1.5 transition-colors duration-200",
                r.ok ? "text-emerald-600" : "text-muted-foreground",
              )}
            >
              {r.ok ? (
                <Check className="h-3 w-3" strokeWidth={2.5} />
              ) : (
                <X className="h-3 w-3" strokeWidth={2.5} />
              )}
              {r.label}
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
