/* eslint-disable @next/next/no-img-element */
import Link from "next/link"

import { BentoGrid } from "@/components/ui/bento-grid"
import { BRAND_LINES } from "@/lib/marketing/brand-lines"
import { cn } from "@/lib/utils"

/** Home "Our Lines" section — Magic UI bento grid linking to each brand line. */
export function HomeBrandLines() {
  return (
    <section className="mx-auto w-full max-w-6xl px-4 sm:px-6 xl:max-w-7xl">
      <p className="text-muted-foreground text-xs font-bold tracking-[0.3em] uppercase">
        Our Lines
      </p>
      <h2 className="text-foreground mt-2 text-2xl font-semibold tracking-tight">
        Professional lines we carry
      </h2>
      <BentoGrid className="mt-8 auto-rows-[14rem] md:auto-rows-[12rem]">
        {BRAND_LINES.map((line) => (
          <Link
            key={line.slug}
            href={`/lines/${line.slug}`}
            className={cn(
              "group relative flex h-full min-h-0 flex-col justify-end overflow-hidden rounded-xl",
              "border border-white/10 shadow-lg transition-opacity duration-300 hover:opacity-95",
              line.className,
            )}
          >
            <img
              src={line.image}
              alt={line.name}
              className="absolute inset-0 h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
            />
            <div
              className="absolute inset-0 bg-gradient-to-t from-black via-black/55 to-black/10"
              aria-hidden
            />
            <div className="relative z-10 p-6">
              <h3 className="text-lg font-semibold text-white sm:text-xl">
                {line.name}
              </h3>
              <p className="mt-1 max-w-md text-sm text-white/85">
                {line.description}
              </p>
            </div>
          </Link>
        ))}
      </BentoGrid>
    </section>
  )
}
