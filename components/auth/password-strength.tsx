"use client"

import { Check, X } from "lucide-react"
import { cn } from "@/lib/utils"
import { PasswordRules, passwordScore } from "@/lib/validation/schemas"

/**
 * Live password-strength indicator: a 3-segment bar plus the four rule
 * checklist. Colors and opacity transition smoothly so the bar never snaps —
 * a deleted password fades all three segments back to muted.
 *
 *   score 0 → all 3 segments dim
 *   score 1 → segment 1 red       (weak)
 *   score 2 → segments 1–2 amber  (medium)
 *   score 3 → all 3 segments green (strong, every rule passes)
 */
export function PasswordStrength({ password }: { password: string }) {
  const score = passwordScore(password)
  const rules = [
    { label: "At least 8 characters", ok: PasswordRules.length(password) },
    { label: "One uppercase letter", ok: PasswordRules.upper(password) },
    { label: "One number", ok: PasswordRules.number(password) },
    { label: "One special (!@#$%^&*)", ok: PasswordRules.special(password) },
  ]

  return (
    <div className="mt-2 flex flex-col gap-2">
      <div className="flex h-1 gap-1.5" aria-hidden>
        {[1, 2, 3].map((seg) => {
          const reached = score >= seg
          const color =
            score === 1
              ? "bg-red-500"
              : score === 2
                ? "bg-amber-500"
                : score === 3
                  ? "bg-emerald-500"
                  : "bg-muted"
          return (
            <span
              key={seg}
              className={cn(
                "h-full flex-1 rounded-full transition-[background-color,opacity] duration-300 ease-out",
                reached ? color : "bg-muted",
                reached ? "opacity-100" : "opacity-60",
              )}
            />
          )
        })}
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
