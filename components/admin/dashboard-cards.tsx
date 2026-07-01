import Link from "next/link"
import { ArrowRight } from "lucide-react"

import { cn } from "@/lib/utils"

interface MetricCardProps {
  label: string
  value: string | number
  /** Optional secondary line, e.g. revenue under an order count. */
  sub?: string
  href: string
  icon: React.FC<{ className?: string; strokeWidth?: number }>
  accent?: "amber" | "neutral"
}

/** A single dashboard metric card linking to its detail section. */
export function MetricCard({
  label,
  value,
  sub,
  href,
  icon: Icon,
  accent = "neutral",
}: MetricCardProps) {
  return (
    <Link href={href}>
      <div className="border-border bg-card hover:border-border-strong rounded-2xl border p-5 transition-colors">
        <div className="mb-4 flex items-start justify-between">
          <p className="text-muted-foreground text-sm font-medium">{label}</p>
          <span className="bg-muted text-muted-foreground flex h-9 w-9 items-center justify-center rounded-lg">
            <Icon className="h-4 w-4" strokeWidth={1.75} />
          </span>
        </div>
        <p
          className={cn(
            "text-3xl font-bold tracking-tight",
            accent === "amber" ? "text-accent-amber" : "text-foreground",
          )}
        >
          {value}
        </p>
        {sub && <p className="text-muted-foreground mt-1 text-sm">{sub}</p>}
        <p className="text-muted-foreground mt-4 flex items-center gap-1 text-sm font-medium">
          Open <ArrowRight className="h-3.5 w-3.5" />
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
    <Link href={href} className="group/quick block">
      <div className="border-border bg-card hover:border-border-strong hover:bg-muted/30 flex items-center gap-4 rounded-2xl border p-4 transition-colors">
        <span className="bg-accent-violet/10 text-accent-violet flex h-11 w-11 shrink-0 items-center justify-center rounded-xl">
          <Icon className="h-5 w-5" strokeWidth={1.75} />
        </span>
        <div className="min-w-0 flex-1">
          <p className="text-foreground text-base font-medium">{label}</p>
          <p className="text-muted-foreground mt-0.5 text-sm leading-snug">
            {description}
          </p>
        </div>
        <ArrowRight className="text-muted-foreground h-4 w-4 shrink-0 transition-transform group-hover/quick:translate-x-0.5" />
      </div>
    </Link>
  )
}
