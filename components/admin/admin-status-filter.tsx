import Link from "next/link"

import { cn } from "@/lib/utils"
import { formatCaseStatus } from "@/lib/utils/format"

interface AdminStatusFilterProps {
  /** Route the filter links point at, e.g. "/admin/orders". */
  basePath: string
  /** Currently active status, or undefined for "All". */
  active?: string
  /** Selectable status values. */
  options: readonly string[]
}

function chipHref(basePath: string, value?: string): string {
  return value ? `${basePath}?status=${value}` : basePath
}

/** Status filter chips that drive a `?status=` search param via links. */
export function AdminStatusFilter({
  basePath,
  active,
  options,
}: AdminStatusFilterProps) {
  const chips: { value: string | undefined; label: string }[] = [
    { value: undefined, label: "All" },
    ...options.map((value) => ({ value, label: formatCaseStatus(value) })),
  ]

  return (
    <div className="flex flex-wrap gap-2">
      {chips.map((chip) => {
        const isActive = chip.value === active || (!chip.value && !active)
        return (
          <Link
            key={chip.label}
            href={chipHref(basePath, chip.value)}
            className={cn(
              "rounded-full border px-3 py-1 text-xs font-medium transition-colors",
              isActive
                ? "border-foreground bg-foreground text-background"
                : "border-border text-muted-foreground hover:bg-muted",
            )}
          >
            {chip.label}
          </Link>
        )
      })}
    </div>
  )
}
