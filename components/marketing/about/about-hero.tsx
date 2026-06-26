import { BentoImage } from "@/components/marketing/about/bento-image"

/** About-page hero: headline, intro copy, and a bento image grid. */
export function AboutHero() {
  return (
    <>
      <section className="text-center">
        <p className="text-muted-foreground text-xs font-medium tracking-[0.3em] uppercase">
          About us
        </p>
        <h1 className="text-foreground mx-auto mt-5 max-w-3xl text-3xl leading-tight font-semibold tracking-tight text-balance sm:text-4xl lg:text-5xl">
          We take pride in delivering exceptional results
        </h1>
        <p className="text-muted-foreground mx-auto mt-5 max-w-xl leading-relaxed text-pretty">
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
    </>
  )
}
