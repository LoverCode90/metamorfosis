import { X } from "lucide-react"
import type { LucideIcon } from "lucide-react"

import { AboutSectionHeading } from "@/components/marketing/about/about-section-heading"
import { BRAND_ASSETS, OTHER_FLAWS } from "@/lib/marketing/about-content"
import { cn } from "@/lib/utils"

/** A single comparison bullet with an icon badge. */
function ComparePoint({
  icon: Icon,
  label,
  positive,
}: {
  icon: LucideIcon
  label: string
  positive: boolean
}) {
  const badgeClass = cn(
    "mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full",
    positive
      ? "bg-background text-foreground"
      : "border-border text-muted-foreground border",
  )
  const labelClass = positive
    ? "text-background text-sm leading-relaxed font-medium"
    : "text-muted-foreground text-sm leading-relaxed"

  return (
    <li className="flex items-start gap-3">
      <span className={badgeClass}>
        <Icon className="h-3 w-3" strokeWidth={2.5} />
      </span>
      <span className={labelClass}>{label}</span>
    </li>
  )
}

/** "Why Metamorfosis" section comparing conventional supplies to the brand. */
export function AboutComparison() {
  return (
    <section className="py-20 sm:py-28">
      <AboutSectionHeading
        eyebrow="Why Metamorfosis"
        title="A better kind of color"
        description="See how our formulas compare to conventional salon supplies."
      />

      <div className="mx-auto mt-10 grid max-w-4xl grid-cols-1 gap-4 md:grid-cols-2">
        <div className="border-border bg-muted/40 rounded-2xl border p-6 sm:p-8">
          <h3 className="text-muted-foreground text-sm font-semibold tracking-wide uppercase">
            Other products / supplies
          </h3>
          <ul className="mt-6 space-y-4">
            {OTHER_FLAWS.map((flaw) => (
              <ComparePoint key={flaw} icon={X} label={flaw} positive={false} />
            ))}
          </ul>
        </div>

        <div className="border-foreground bg-foreground text-background rounded-2xl border p-6 sm:p-8">
          <h3 className="text-background/70 text-sm font-semibold tracking-wide uppercase">
            Metamorfosis
          </h3>
          <ul className="mt-6 space-y-4">
            {BRAND_ASSETS.map(({ icon, label }) => (
              <ComparePoint key={label} icon={icon} label={label} positive />
            ))}
          </ul>
        </div>
      </div>
    </section>
  )
}
