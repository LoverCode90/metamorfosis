/* eslint-disable @next/next/no-img-element */
import Link from "next/link"
import { ArrowRight } from "lucide-react"

const BRAND_LINES = [
  {
    id: "nutrapel",
    name: "Nutrapel",
    tagline: "Bond-strengthening care system",
    category: "Bond & Repair",
    image: "/home/brand-nutrapel.png",
  },
  {
    id: "bbcos",
    name: "BBCos",
    tagline: "Professional permanent color line",
    category: "Color",
    image: "/home/brand-bbcos.png",
  },
  {
    id: "brazilian-nano",
    name: "Brazilian Nano",
    tagline: "Premium nanoplasty treatment range",
    category: "Smoothing",
    image: "/home/brand-nano.png",
  },
  {
    id: "level3",
    name: "Level 3",
    tagline: "Technical styling gel & fiber system",
    category: "Styling",
    image: "/home/brand-level3.png",
  },
]

/** Home "Our Lines" section linking out to the four professional brands. */
export function HomeBrandLines() {
  return (
    <section className="mx-auto w-full max-w-6xl px-4 sm:px-6 xl:max-w-7xl">
      <p className="text-muted-foreground text-xs font-bold tracking-[0.3em] uppercase">
        Our Lines
      </p>
      <h2 className="text-foreground mt-2 text-2xl font-semibold tracking-tight">
        Four pillars of professional care
      </h2>
      <div className="mt-8 flex flex-col gap-4">
        {BRAND_LINES.map((brand) => (
          <Link
            key={brand.id}
            href="/products"
            className="group border-border bg-card hover:border-foreground/20 hover:bg-muted flex items-center gap-5 rounded-2xl border p-5 text-left transition-colors sm:gap-7"
          >
            <div className="border-border bg-background h-20 w-20 shrink-0 overflow-hidden rounded-xl border sm:h-24 sm:w-24">
              <img
                src={brand.image}
                alt={brand.name}
                className="h-full w-full object-cover"
              />
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-muted-foreground text-[11px] font-semibold tracking-widest uppercase">
                {brand.category}
              </p>
              <h3 className="text-foreground mt-0.5 text-lg font-semibold">
                {brand.name}
              </h3>
              <p className="text-muted-foreground mt-0.5 text-sm">
                {brand.tagline}
              </p>
            </div>
            <ArrowRight
              className="text-muted-foreground mr-1 h-5 w-5 shrink-0 transition-transform group-hover:translate-x-1"
              strokeWidth={1.75}
            />
          </Link>
        ))}
      </div>
    </section>
  )
}
