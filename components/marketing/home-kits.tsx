import { KitCard, type Kit } from "@/components/marketing/home-kit-card"

const KITS: Kit[] = [
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

/** Home "Ready-to-work kits" curated-bundles section. */
export function HomeKits() {
  return (
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
            <KitCard key={kit.title} kit={kit} />
          ))}
        </div>
      </div>
    </section>
  )
}
