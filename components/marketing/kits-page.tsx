import { Sparkles } from "lucide-react"

import { Badge } from "@/components/ui/badge"

const PLANNED_KITS = [
  {
    brand: "Earthia Color",
    description: "10 natural shades + 10 extras from the natural range.",
  },
  {
    brand: "Color Tech",
    description: "10 natural shades + 10 extras from the natural range.",
  },
  {
    brand: "UHD",
    description: "10 natural shades + 10 extras from the natural range.",
  },
  {
    brand: "Tech Color 0",
    description: "10 natural shades + 10 extras from the natural range.",
  },
  {
    brand: "Developers & peroxides",
    description: "Peroxide volumes matched to professional color work.",
  },
] as const

/** Placeholder kits landing — layout preview until catalog is wired. */
export function KitsPage() {
  return (
    <div className="mx-auto w-full max-w-6xl px-4 py-12 sm:px-6 sm:py-16 xl:max-w-7xl">
      <div className="max-w-2xl">
        <Badge className="border-transparent bg-violet-600 text-white">
          <Sparkles className="size-3" />
          30% professional discount
        </Badge>
        <h1 className="text-foreground mt-4 text-3xl font-semibold tracking-tight sm:text-4xl">
          Professional color kits
        </h1>
        <p className="text-muted-foreground mt-3 text-sm leading-relaxed sm:text-base">
          Exclusive bundles for licensed colorists — curated natural-gamut
          shades, extra tones, and the developers you need in one place.
        </p>
      </div>

      <div className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {PLANNED_KITS.map((kit) => (
          <article
            key={kit.brand}
            className="border-border bg-card flex flex-col rounded-xl border p-6"
          >
            <h2 className="text-foreground text-lg font-semibold tracking-tight">
              {kit.brand}
            </h2>
            <p className="text-muted-foreground mt-2 flex-1 text-sm leading-relaxed">
              {kit.description}
            </p>
            <p className="text-muted-foreground mt-4 text-xs font-medium tracking-wide uppercase">
              Coming soon
            </p>
          </article>
        ))}
      </div>
    </div>
  )
}
