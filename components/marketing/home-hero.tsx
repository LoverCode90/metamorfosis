/* eslint-disable @next/next/no-img-element */
import { ArrowRight } from "lucide-react"
import Link from "next/link"

export function HomeHero() {
  return (
    <section className="bg-foreground relative flex min-h-[88vh] items-end overflow-hidden">
      <img
        src="/home/hero-bg.png"
        alt=""
        aria-hidden="true"
        className="absolute inset-0 h-full w-full object-cover"
      />
      <div
        className="absolute inset-0"
        style={{
          background:
            "linear-gradient(to right, rgba(0,0,0,0.90) 0%, rgba(0,0,0,0.75) 36%, rgba(0,0,0,0.28) 68%, rgba(0,0,0,0.06) 100%)",
        }}
      />
      <div className="absolute inset-0 bg-gradient-to-t from-black/55 via-transparent to-transparent" />

      <div className="relative z-10 mx-auto w-full max-w-6xl px-4 pb-24 sm:px-6 xl:max-w-7xl">
        <p className="text-sm font-semibold tracking-[0.35em] text-white/50 uppercase">
          Professional Color Lab
        </p>
        <h1 className="mt-5 max-w-2xl text-5xl leading-[1.06] font-semibold tracking-tight text-balance text-white sm:text-6xl lg:text-7xl">
          Salon-grade color,
          <br />
          perfected.
        </h1>
        <p className="mt-5 max-w-lg text-sm leading-relaxed text-pretty text-white/65 sm:text-base">
          Permanent crème color, bond care, and professional tools — engineered
          for colorists who refuse to compromise.
        </p>
        <div className="mt-8 flex flex-wrap items-center gap-4">
          <Link
            href="/products"
            className="text-foreground inline-flex h-11 items-center gap-2 rounded-md bg-white px-6 text-sm font-semibold transition-opacity hover:opacity-90"
          >
            Shop the catalog
            <ArrowRight className="h-4 w-4" strokeWidth={2} />
          </Link>
        </div>
      </div>
    </section>
  )
}
