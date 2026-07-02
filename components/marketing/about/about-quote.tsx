import Image from "next/image"
import { Quote } from "lucide-react"

const FOUNDER_QUOTE = {
  text: "Metamorfosis was born behind the chair. As a colorist, I grew tired of choosing between high-performance results and hair health. I built this line to give beauty professionals absolute creative control and clients the flawless hair they deserve.",
  name: "Alexandra Alvarez",
  title: "Founder & Master's in Colorimetry",
} as const

/** Founder testimonial pull-quote section. */
export function AboutQuote() {
  return (
    <section className="mx-auto max-w-3xl pt-16 pb-10 text-center sm:pt-20 sm:pb-12">
      <Quote className="text-foreground mx-auto h-8 w-8" strokeWidth={1.75} />
      <blockquote className="text-foreground mt-6 text-xl leading-relaxed font-medium text-balance sm:text-2xl">
        &ldquo;{FOUNDER_QUOTE.text}&rdquo;
      </blockquote>
      <div className="mt-8 flex items-center justify-center gap-3">
        <div className="relative h-11 w-11 shrink-0 overflow-hidden rounded-full">
          <Image
            src="/about/about-image-3.webp"
            alt={FOUNDER_QUOTE.name}
            fill
            sizes="44px"
            className="object-cover object-top grayscale"
          />
        </div>
        <div className="text-left">
          <p className="text-foreground text-sm font-semibold">
            {FOUNDER_QUOTE.name}
          </p>
          <p className="text-muted-foreground text-xs">{FOUNDER_QUOTE.title}</p>
        </div>
      </div>
    </section>
  )
}
