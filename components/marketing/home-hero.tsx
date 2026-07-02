import { ArrowRight } from "lucide-react"
import Image from "next/image"
import Link from "next/link"

export function HomeHero() {
  return (
    <section className="bg-foreground relative flex min-h-[88vh] items-end overflow-hidden">
      <Image
        src="/home/banner-image.webp"
        alt=""
        fill
        priority
        sizes="100vw"
        className="object-cover object-center"
        aria-hidden
      />

      <div
        className="absolute inset-0 bg-gradient-to-r from-black/92 via-black/55 to-transparent"
        aria-hidden
      />

      <div className="relative z-10 mx-auto w-full max-w-6xl px-4 pb-24 sm:px-6 xl:max-w-7xl">
        <div className="max-w-2xl">
          <p className="text-sm font-semibold tracking-[0.35em] text-white/70 uppercase">
            Professional Beauty Supply
          </p>
          <h1 className="mt-5 text-5xl leading-[1.06] font-semibold tracking-tight text-balance text-white sm:text-6xl lg:text-7xl">
            Your next transformation starts here.
          </h1>
          <p className="mt-5 max-w-lg text-sm leading-relaxed text-pretty text-white/80 sm:text-base">
            From permanent color to bond repair — everything a stylist trusts,
            in one place.
          </p>
          <div className="mt-8 flex flex-wrap items-center gap-4">
            <Link
              href="/products"
              className="inline-flex h-11 items-center gap-2 rounded-md bg-white px-6 text-sm font-semibold text-neutral-900 transition-opacity hover:opacity-90"
            >
              Shop the catalog
              <ArrowRight className="h-4 w-4" strokeWidth={2} />
            </Link>
          </div>
        </div>
      </div>
    </section>
  )
}
