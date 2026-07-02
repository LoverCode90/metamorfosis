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

      <div className="mt-10 grid grid-cols-2 gap-3 sm:gap-4">
        <BentoImage
          src="/about/about-image-2.webp"
          alt="Professional certification and credentials"
          objectPosition="center 50px"
        />
        <BentoImage
          src="/about/about-image-3.webp"
          alt="Stylist working on color in the studio"
        />
      </div>
    </>
  )
}
