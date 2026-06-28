import { Check, FlaskConical, Leaf, Recycle } from "lucide-react"
import type { LucideIcon } from "lucide-react"

export interface TeamMember {
  name: string
  role: string
  image: string
}

/** Studio team members shown in the "Meet the team" grid. */
export const TEAM: TeamMember[] = [
  {
    name: "Sofia Marchetti",
    role: "Founder & Cosmetology Master",
    image: "/about/team-owner.png",
  },
  {
    name: "Daniel Okafor",
    role: "Senior Stylist",
    image: "/about/team-stylist-1.png",
  },
  {
    name: "Lena Brooks",
    role: "Color Stylist",
    image: "/about/team-stylist-2.png",
  },
]

/** Shortcomings of conventional supplies, for the comparison panel. */
export const OTHER_FLAWS: string[] = [
  "Harsh chemical formulations",
  "Non-biodegradable contents",
  "Animal-derived ingredients & testing",
  "Generic, one-size-fits-all results",
  "Ammonia-heavy, scalp-irritating bases",
]

export interface BrandAsset {
  icon: LucideIcon
  label: string
}

/** Metamorfosis differentiators, for the comparison panel. */
export const BRAND_ASSETS: BrandAsset[] = [
  { icon: Leaf, label: "100% vegan, cruelty-free formulas" },
  { icon: Recycle, label: "Biodegradable, low-impact ingredients" },
  { icon: FlaskConical, label: "Professional-tier technical performance" },
  { icon: Check, label: "Tailored shades engineered per client" },
  { icon: Check, label: "Bond-safe, ammonia-free chemistry" },
]

export interface Faq {
  q: string
  a: string
}

/** Frequently asked questions shown in the about-page accordion. */
export const FAQS: Faq[] = [
  {
    q: "What makes Metamorfosis professional formulas different from retail brands?",
    a: "Our products are engineered specifically for salon performance. We use high-density pigment payloads and structural repair ingredients that ensure predictable, long-lasting results while protecting the hair's integrity from the inside out.",
  },
  {
    q: "Are Metamorfosis products safe to use alongside treatments like nanoplasty or keratin?",
    a: "Absolutely. Our formulas are completely free of harsh sulfates and heavy sodium chloride, making them ideal for maintaining and extending the lifespan of complex technical procedures and professional straightening.",
  },
  {
    q: "Do I need a professional license to purchase?",
    a: "Our professional-tier color and lighteners require a valid cosmetology or barbering license, which you verify once. Care and styling essentials are open to everyone.",
  },
  {
    q: "How are the ingredients biodegradable?",
    a: "Our actives and surfactants break down naturally in water treatment systems, and our packaging is designed for recyclability to keep environmental impact low.",
  },
  {
    q: "Can I get color matching support for a client?",
    a: "Yes. Verified professionals get access to our colorist support team for custom formulation guidance and shade-mapping on complex transformations.",
  },
]
