"use client"

import { ArrowRight } from "lucide-react"
import { useCart } from "./cart-context"

const COPY: Record<string, { eyebrow: string; title: string; body: string }> = {
  home: {
    eyebrow: "Metamorfosis Lab",
    title: "Professional color, perfected.",
    body: "Salon-grade permanent color, bond care, and the tools to apply them — engineered for colorists who refuse to compromise.",
  },
  products: {
    eyebrow: "Catalog",
    title: "Products",
    body: "Browse the full Metamorfosis Lab system — from permanent crème shades to post-color treatments.",
  },
  academy: {
    eyebrow: "Education",
    title: "Academy",
    body: "Masterclasses, formulation guides, and certification paths from our resident color educators.",
  },
  about: {
    eyebrow: "Our story",
    title: "About",
    body: "We formulate, test, and manufacture every product in-house. No shortcuts, no filler — only what your work deserves.",
  },
}

export function PlaceholderPage({ view }: { view: keyof typeof COPY }) {
  const { setView } = useCart()
  const copy = COPY[view] ?? COPY.home

  return (
    <section className="mx-auto flex min-h-[70vh] max-w-3xl flex-col items-center justify-center px-4 py-20 text-center sm:px-6">
      <p className="text-xs font-medium uppercase tracking-[0.3em] text-muted-foreground">
        {copy.eyebrow}
      </p>
      <h1 className="mt-5 text-balance text-4xl font-semibold tracking-tight text-foreground sm:text-5xl">
        {copy.title}
      </h1>
      <p className="mt-5 max-w-xl text-pretty leading-relaxed text-muted-foreground">
        {copy.body}
      </p>
      <button
        type="button"
        onClick={() => setView("cart")}
        className="mt-8 inline-flex h-12 items-center gap-2 rounded-md bg-foreground px-6 text-sm font-semibold text-background transition-opacity hover:opacity-90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
      >
        View your cart
        <ArrowRight className="h-4 w-4" strokeWidth={2} />
      </button>
    </section>
  )
}
