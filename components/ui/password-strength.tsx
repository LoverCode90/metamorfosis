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

const STRENGTH_BAR_COLORS: Record<number, string> = {
  1: "bg-red-500",
  2: "bg-amber-500",
  3: "bg-emerald-500",
}

const PASSWORD_RULE_DEFS: { label: string; test: (pw: string) => boolean }[] = [
  { label: "At least 8 characters", test: PasswordRules.length },
  { label: "One uppercase letter", test: PasswordRules.upper },
  { label: "One number", test: PasswordRules.number },
  { label: "One special (!@#$%^&*)", test: PasswordRules.special },
]

export function PasswordStrength({ password }: { password: string }) {
  const score = passwordScore(password)
  const rules = PASSWORD_RULE_DEFS.map((rule) => ({
    label: rule.label,
    ok: rule.test(password),
  }))
  const barColor = STRENGTH_BAR_COLORS[score] ?? "bg-muted"

  return (
    <div className="mt-2 flex flex-col gap-2">
      <div className="flex items-center gap-2">
        <div className="flex h-1 flex-1 gap-1.5" aria-hidden>
          {[1, 2, 3].map((segment) => {
            const reached = score >= segment
            return (
              <span
                key={segment}
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
          {rules.map((rule) => (
            <li
              key={rule.label}
              className={cn(
                "flex items-center gap-1.5 transition-colors duration-200",
                rule.ok ? "text-emerald-600" : "text-muted-foreground",
              )}
            >
              {rule.ok ? (
                <Check className="h-3 w-3" strokeWidth={2.5} />
              ) : (
                <X className="h-3 w-3" strokeWidth={2.5} />
              )}
              {rule.label}
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
