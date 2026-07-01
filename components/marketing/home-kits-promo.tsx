import Link from "next/link"
import { ArrowRight, Sparkles } from "lucide-react"

import { Badge } from "@/components/ui/badge"

const KIT_LINES = [
  "Earthia Color",
  "Color Tech",
  "UHD",
  "Tech Color 0",
] as const

/** Home promo card — professional color kits with 30% off. */
export function HomeKitsPromo() {
  return (
    <section className="mx-auto w-full max-w-6xl px-4 sm:px-6 xl:max-w-7xl">
      <Link
        href="/kits"
        className="group border-border bg-card relative block overflow-hidden rounded-2xl border shadow-lg transition-shadow hover:shadow-xl"
      >
        <div
          className="pointer-events-none absolute -top-24 -right-16 h-64 w-64 rounded-full bg-violet-500/20 blur-3xl"
          aria-hidden
        />
        <div
          className="pointer-events-none absolute -bottom-20 -left-12 h-48 w-48 rounded-full bg-fuchsia-500/10 blur-3xl"
          aria-hidden
        />

        <div className="relative grid gap-8 p-8 sm:p-10 lg:grid-cols-[1fr_auto] lg:items-center lg:gap-12">
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-3">
              <Badge className="border-transparent bg-violet-600 text-white">
                <Sparkles className="size-3" />
                30% off
              </Badge>
              <span className="text-muted-foreground text-xs font-bold tracking-[0.25em] uppercase">
                For professionals
              </span>
            </div>

            <h2 className="text-foreground mt-4 text-2xl font-semibold tracking-tight text-balance sm:text-3xl">
              Exclusive professional color kits
            </h2>
            <p className="text-muted-foreground mt-3 max-w-xl text-sm leading-relaxed sm:text-base">
              Curated kits built for color work — 10 natural shades plus 10
              extras from each line, plus developers and peroxide essentials.
            </p>

            <ul className="mt-6 flex flex-wrap gap-2">
              {KIT_LINES.map((line) => (
                <li
                  key={line}
                  className="border-border bg-muted/50 text-foreground rounded-full border px-3 py-1 text-xs font-medium"
                >
                  {line}
                </li>
              ))}
              <li className="border-border bg-muted/50 text-foreground rounded-full border px-3 py-1 text-xs font-medium">
                Developers & peroxides
              </li>
            </ul>
          </div>

          <div className="border-border bg-muted/30 flex flex-col items-start gap-4 rounded-xl border p-5 sm:min-w-[220px] lg:items-end lg:text-right">
            <p className="text-muted-foreground text-xs leading-relaxed">
              Natural-gamut sets · verified pros only
            </p>
            <span className="inline-flex items-center gap-2 text-sm font-semibold text-violet-400 transition-[gap] group-hover:gap-3">
              View kits
              <ArrowRight className="size-4" strokeWidth={2} />
            </span>
          </div>
        </div>
      </Link>
    </section>
  )
}
