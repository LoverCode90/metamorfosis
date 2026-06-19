/* eslint-disable @next/next/no-img-element */
"use client"

import Link from "next/link"
import { ArrowRight } from "lucide-react"
import { HomeHero } from "./home-hero"
import { HomeFooter } from "./home-footer"

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

const KITS = [
  {
    tag: "Most Complete",
    title: "Full Colorimetry Kit",
    items: [
      "Developer 10 / 20 / 30 / 40 vol",
      "24 permanent shades",
      "Mixing bowls · tint brushes · foil sheets",
      "Nitrile gloves · laminated color chart",
    ],
    dark: true,
  },
  {
    tag: "Bond & Repair",
    title: "Bond Care Bundle",
    items: [
      "Bond Serum 50 ml",
      "Repair Mask 200 ml",
      "Protective Spray 150 ml",
    ],
    dark: false,
  },
  {
    tag: "Smoothing",
    title: "Smoothing Trio",
    items: [
      "Pre-cleanser 300 ml",
      "Nano formula 500 ml",
      "Finishing serum 100 ml",
    ],
    dark: false,
  },
  {
    tag: "Color Correction",
    title: "Toner & Pigment Set",
    items: [
      "Cool-ash toner — 3 shades",
      "Violet pigment booster",
      "10 vol developer",
    ],
    dark: true,
  },
]

export function HomePage() {
  return (
    <div className="flex flex-col gap-y-24">
      <HomeHero />

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

      <section className="bg-muted/40 py-20">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 xl:max-w-7xl">
          <p className="text-muted-foreground text-xs font-bold tracking-[0.3em] uppercase">
            Curated for Professionals
          </p>
          <h2 className="text-foreground mt-2 text-2xl font-semibold tracking-tight">
            Ready-to-work kits
          </h2>
          <div className="border-border bg-border mt-10 grid grid-cols-1 gap-px overflow-hidden rounded-2xl border sm:grid-cols-2">
            {KITS.map((kit) => (
              <Link
                key={kit.title}
                href="/products"
                className={[
                  "group flex flex-col justify-between p-8 text-left transition-opacity hover:opacity-90",
                  kit.dark ? "bg-foreground" : "bg-card",
                ].join(" ")}
              >
                <div>
                  <span
                    className={[
                      "text-[11px] font-bold tracking-[0.2em] uppercase",
                      kit.dark ? "text-white/45" : "text-muted-foreground",
                    ].join(" ")}
                  >
                    {kit.tag}
                  </span>
                  <h3
                    className={[
                      "mt-3 text-xl font-semibold tracking-tight",
                      kit.dark ? "text-white" : "text-foreground",
                    ].join(" ")}
                  >
                    {kit.title}
                  </h3>
                  <ul className="mt-4 flex flex-col gap-1.5">
                    {kit.items.map((item) => (
                      <li
                        key={item}
                        className={[
                          "flex items-start gap-2 text-sm",
                          kit.dark ? "text-white/60" : "text-muted-foreground",
                        ].join(" ")}
                      >
                        <span className="mt-[5px] h-1 w-1 shrink-0 rounded-full bg-current opacity-50" />
                        {item}
                      </li>
                    ))}
                  </ul>
                </div>
                <span
                  className={[
                    "mt-8 inline-flex items-center gap-1.5 text-xs font-semibold transition-[gap] group-hover:gap-2",
                    kit.dark ? "text-white/70" : "text-foreground/70",
                  ].join(" ")}
                >
                  View kit{" "}
                  <ArrowRight className="h-3.5 w-3.5" strokeWidth={2} />
                </span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      <HomeFooter />
    </div>
  )
}
