"use client"

import { Leaf, Recycle, FlaskConical, Check, X, Quote, ArrowRight } from "lucide-react"
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion"
import { useCart } from "../cart-context"

// ---------------------------------------------------------------------------
// Static presentation data — intentionally isolated from any data hooks.
// ---------------------------------------------------------------------------
const TEAM = [
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

const OTHER_FLAWS = [
  "Harsh chemical formulations",
  "Non-biodegradable contents",
  "Animal-derived ingredients & testing",
  "Generic, one-size-fits-all results",
  "Ammonia-heavy, scalp-irritating bases",
]

const BRAND_ASSETS = [
  { icon: Leaf, label: "100% vegan, cruelty-free formulas" },
  { icon: Recycle, label: "Biodegradable, low-impact ingredients" },
  { icon: FlaskConical, label: "Professional-tier technical performance" },
  { icon: Check, label: "Tailored shades engineered per client" },
  { icon: Check, label: "Bond-safe, ammonia-free chemistry" },
]

const FAQS = [
  {
    q: "Are your products safe for sensitive scalps?",
    a: "Yes. Every formula is ammonia-free and bond-safe, built on a low-irritation base that's been dermatologically reviewed for professional and sensitive-scalp use.",
  },
  {
    q: "Are Metamorfosis products truly vegan and cruelty-free?",
    a: "Completely. We use zero animal-derived ingredients and never test on animals at any stage — from raw material to finished product.",
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

export function AboutPage() {
  const { setView } = useCart()

  return (
    <div className="mx-auto max-w-6xl px-4 py-12 sm:px-6 sm:py-16 lg:py-20">
      {/* ---------------------------------------------------------------- */}
      {/* Hero + asymmetrical bento grid */}
      {/* ---------------------------------------------------------------- */}
      <section className="text-center">
        <p className="text-xs font-medium uppercase tracking-[0.3em] text-muted-foreground">
          About us
        </p>
        <h1 className="mx-auto mt-5 max-w-3xl text-balance text-3xl font-semibold leading-tight tracking-tight text-foreground sm:text-4xl lg:text-5xl">
          We take pride in delivering exceptional results
        </h1>
        <p className="mx-auto mt-5 max-w-xl text-pretty leading-relaxed text-muted-foreground">
          A professional color house built on craft and conscience — formulating
          high-performance, vegan, biodegradable color for salons that refuse to
          compromise.
        </p>
      </section>

      <div className="mt-10 grid auto-rows-[180px] grid-cols-2 gap-3 sm:auto-rows-[220px] sm:gap-4 lg:grid-cols-4">
        <BentoImage
          src="/about/hero-salon-portrait.png"
          alt="Master colorist in the studio"
          className="col-span-2 row-span-2"
        />
        <BentoImage
          src="/about/hero-team-working.png"
          alt="The Metamorfosis team collaborating"
          className="col-span-2"
        />
        <BentoImage
          src="/about/hero-detail-coloring.png"
          alt="Mixing custom color with a tint brush"
          className="col-span-2"
        />
      </div>

      {/* ---------------------------------------------------------------- */}
      {/* Testimonial quote — Salon Owner */}
      {/* ---------------------------------------------------------------- */}
      <section className="mx-auto max-w-3xl py-20 text-center sm:py-28">
        <Quote className="mx-auto h-8 w-8 text-foreground" strokeWidth={1.75} />
        <blockquote className="mt-6 text-balance text-xl font-medium leading-relaxed text-foreground sm:text-2xl">
          &ldquo;Switching my salon to Metamorfosis changed everything. The color
          pays off beautifully on the hair, my clients&apos; scalps stay calm, and
          I can finally stand behind every formula I use.&rdquo;
        </blockquote>
        <div className="mt-8 flex items-center justify-center gap-3">
          <img
            src="/about/team-owner.png"
            alt="Sofia Marchetti"
            className="h-11 w-11 rounded-full object-cover grayscale"
          />
          <div className="text-left">
            <p className="text-sm font-semibold text-foreground">Sofia Marchetti</p>
            <p className="text-xs text-muted-foreground">Salon Owner & Founder</p>
          </div>
        </div>
      </section>

      {/* ---------------------------------------------------------------- */}
      {/* Meet the team */}
      {/* ---------------------------------------------------------------- */}
      <section>
        <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-xs font-medium uppercase tracking-[0.3em] text-muted-foreground">
              Our team
            </p>
            <h2 className="mt-3 text-2xl font-semibold tracking-tight text-foreground sm:text-3xl">
              Meet the team
            </h2>
          </div>
          <p className="max-w-md text-sm leading-relaxed text-muted-foreground">
            A close-knit studio led by a cosmetology master and powered by stylists
            who live and breathe the craft of color.
          </p>
        </div>

        <div className="mt-10 grid grid-cols-1 gap-5 sm:grid-cols-3">
          {TEAM.map((member) => (
            <article
              key={member.name}
              className="group overflow-hidden rounded-xl border border-border bg-card transition-colors hover:border-foreground/30"
            >
              <div className="aspect-[4/5] overflow-hidden bg-muted">
                <img
                  src={member.image || "/placeholder.svg"}
                  alt={member.name}
                  className="h-full w-full object-cover grayscale transition-transform duration-500 group-hover:scale-[1.03]"
                />
              </div>
              <div className="p-5 text-center">
                <h3 className="text-base font-semibold text-foreground">
                  {member.name}
                </h3>
                <p className="mt-1 text-sm text-muted-foreground">{member.role}</p>
              </div>
            </article>
          ))}
        </div>
      </section>

      {/* ---------------------------------------------------------------- */}
      {/* Brand comparison matrix */}
      {/* ---------------------------------------------------------------- */}
      <section className="py-20 sm:py-28">
        <div className="text-center">
          <p className="text-xs font-medium uppercase tracking-[0.3em] text-muted-foreground">
            Why Metamorfosis
          </p>
          <h2 className="mt-3 text-2xl font-semibold tracking-tight text-foreground sm:text-3xl">
            A better kind of color
          </h2>
          <p className="mx-auto mt-3 max-w-lg text-sm leading-relaxed text-muted-foreground">
            See how our formulas compare to conventional salon supplies.
          </p>
        </div>

        <div className="mx-auto mt-10 grid max-w-4xl grid-cols-1 gap-4 md:grid-cols-2">
          {/* Other products */}
          <div className="rounded-2xl border border-border bg-muted/40 p-6 sm:p-8">
            <h3 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">
              Other products / supplies
            </h3>
            <ul className="mt-6 space-y-4">
              {OTHER_FLAWS.map((flaw) => (
                <li key={flaw} className="flex items-start gap-3">
                  <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full border border-border text-muted-foreground">
                    <X className="h-3 w-3" strokeWidth={2.5} />
                  </span>
                  <span className="text-sm leading-relaxed text-muted-foreground">
                    {flaw}
                  </span>
                </li>
              ))}
            </ul>
          </div>

          {/* Metamorfosis */}
          <div className="rounded-2xl border border-foreground bg-foreground p-6 text-background sm:p-8">
            <h3 className="text-sm font-semibold uppercase tracking-wide text-background/70">
              Metamorfosis
            </h3>
            <ul className="mt-6 space-y-4">
              {BRAND_ASSETS.map(({ icon: Icon, label }) => (
                <li key={label} className="flex items-start gap-3">
                  <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-background text-foreground">
                    <Icon className="h-3 w-3" strokeWidth={2.5} />
                  </span>
                  <span className="text-sm font-medium leading-relaxed text-background">
                    {label}
                  </span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      {/* ---------------------------------------------------------------- */}
      {/* FAQ — ends directly with the Contact Us button block */}
      {/* ---------------------------------------------------------------- */}
      <section className="mx-auto max-w-3xl">
        <div className="text-center">
          <p className="text-xs font-medium uppercase tracking-[0.3em] text-muted-foreground">
            FAQs
          </p>
          <h2 className="mt-3 text-2xl font-semibold tracking-tight text-foreground sm:text-3xl">
            Have questions? We&apos;ve got answers
          </h2>
        </div>

        <Accordion className="mt-10">
          {FAQS.map((faq, i) => (
            <AccordionItem key={faq.q} value={`faq-${i}`}>
              <AccordionTrigger className="py-5 text-base text-foreground">
                {faq.q}
              </AccordionTrigger>
              <AccordionContent className="pr-6 text-sm leading-relaxed text-muted-foreground">
                {faq.a}
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>

        <div className="mt-12 flex flex-col items-center gap-4 rounded-2xl border border-border bg-card px-6 py-10 text-center">
          <h3 className="text-lg font-semibold text-foreground">
            Can&apos;t find your answer?
          </h3>
          <p className="max-w-sm text-sm leading-relaxed text-muted-foreground">
            Get in touch with our team — we&apos;re friendly and happy to help.
          </p>
          <button
            type="button"
            onClick={() => setView("home")}
            className="inline-flex h-11 items-center gap-2 rounded-md bg-foreground px-6 text-sm font-semibold text-background transition-opacity hover:opacity-90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
          >
            Contact Us
            <ArrowRight className="h-4 w-4" strokeWidth={2} />
          </button>
        </div>
      </section>
    </div>
  )
}

function BentoImage({
  src,
  alt,
  className,
}: {
  src: string
  alt: string
  className?: string
}) {
  return (
    <div
      className={`overflow-hidden rounded-xl border border-border bg-muted ${className ?? ""}`}
    >
      <img
        src={src || "/placeholder.svg"}
        alt={alt}
        className="h-full w-full object-cover grayscale"
      />
    </div>
  )
}
