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
      <p className="text-muted-foreground text-xs font-medium tracking-[0.3em] uppercase">
        {copy.eyebrow}
      </p>
      <h1 className="text-foreground mt-5 text-4xl font-semibold tracking-tight text-balance sm:text-5xl">
        {copy.title}
      </h1>
      <p className="text-muted-foreground mt-5 max-w-xl leading-relaxed text-pretty">
        {copy.body}
      </p>
      <button
        type="button"
        onClick={() => setView("cart")}
        className="bg-foreground text-background focus-visible:ring-ring mt-8 inline-flex h-12 items-center gap-2 rounded-md px-6 text-sm font-semibold transition-opacity hover:opacity-90 focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-none"
      >
        View your cart
        <ArrowRight className="h-4 w-4" strokeWidth={2} />
      </button>
    </section>
  )
}
