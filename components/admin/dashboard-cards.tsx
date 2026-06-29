import Link from "next/link"
import { ArrowRight } from "lucide-react"

import { cn } from "@/lib/utils"

interface MetricCardProps {
  label: string
  value: string | number
  /** Optional secondary line, e.g. revenue under an order count. */
  sub?: string
  href: string
  accent?: "amber" | "neutral"
}

/** A single dashboard metric card linking to its detail section. */
export function MetricCard({
  label,
  value,
  sub,
  href,
  accent = "neutral",
}: MetricCardProps) {
  return (
    <Link href={href}>
      <div className="border-border bg-background hover:bg-muted/40 rounded-xl border p-5 transition-colors">
        <p
          className={cn(
            "text-3xl font-bold tracking-tight",
            accent === "amber" ? "text-amber-400" : "text-foreground",
          )}
        >
          {value}
        </p>
        <p className="text-muted-foreground mt-1 text-sm">{label}</p>
        {sub && <p className="text-muted-foreground mt-0.5 text-xs">{sub}</p>}
        <p className="text-muted-foreground mt-3 flex items-center gap-1 text-xs">
          View all <ArrowRight className="h-3 w-3" />
        </p>
      </div>
    </Link>
  )
}

interface QuickLinkProps {
  href: string
  icon: React.FC<{ className?: string; strokeWidth?: number }>
  label: string
  description: string
}

/** A quick-action shortcut card. */
export function QuickLink({
  href,
  icon: Icon,
  label,
  description,
}: QuickLinkProps) {
  return (
    <Link href={href}>
      <div className="border-border bg-background hover:bg-muted/40 flex items-start gap-4 rounded-xl border p-5 transition-colors">
        <span className="bg-muted mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-lg">
          <Icon className="text-foreground h-4 w-4" strokeWidth={1.75} />
        </span>
        <div>
          <p className="text-foreground text-sm font-medium">{label}</p>
          <p className="text-muted-foreground mt-0.5 text-xs leading-relaxed">
            {description}
          </p>
        </div>
      </div>
    </Link>
  )
}
