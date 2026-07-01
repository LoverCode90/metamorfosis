export interface BrandLine {
  slug: string
  name: string
  description: string
  image: string
  /** Bento grid column / row span classes */
  className: string
}

export const BRAND_LINES: BrandLine[] = [
  {
    slug: "brazilian-nano",
    name: "Brazilian Nano",
    description: "Professional nanoplasty treatments.",
    image: "/home/brand-nano.png",
    className: "col-span-3 md:col-span-1 md:row-span-2",
  },
  {
    slug: "nutrapel",
    name: "Nutrapel",
    description: "Bond repair and hair restoration line.",
    image: "/home/brand-nutrapel.png",
    className: "col-span-3 md:col-span-1 md:row-span-3",
  },
  {
    slug: "earthia-colors",
    name: "Earthia Colors",
    description: "Ammonia-free professional color.",
    image: "/home/brand-earthia.png",
    className: "col-span-3 md:col-span-1",
  },
  {
    slug: "bbcos",
    name: "BBCos",
    description: "High-end Italian hair care and treatment.",
    image: "/home/brand-bbcos.png",
    className: "col-span-3 md:col-span-1 md:row-span-2",
  },
  {
    slug: "level-3",
    name: "Level 3",
    description: "Technical styling gels and fiber systems.",
    image: "/home/brand-level3.png",
    className: "col-span-3 md:col-span-1",
  },
]

export const BRAND_LINE_SLUGS = BRAND_LINES.map((line) => line.slug)

export function getBrandLineBySlug(slug: string): BrandLine | undefined {
  return BRAND_LINES.find((line) => line.slug === slug)
}
