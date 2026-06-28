/* eslint-disable @next/next/no-img-element */
import { Quote } from "lucide-react"

const FOUNDER_QUOTE = {
  text: "Metamorfosis was born behind the chair. As a colorist, I grew tired of choosing between high-performance results and hair health. I built this line to give beauty professionals absolute creative control and clients the flawless hair they deserve.",
  name: "Alexandra Alvarez",
  title: "Founder & Master's in Colorimetry",
} as const

/** Founder testimonial pull-quote section. */
export function AboutQuote() {
  return (
    <section className="mx-auto max-w-3xl py-20 text-center sm:py-28">
      <Quote className="text-foreground mx-auto h-8 w-8" strokeWidth={1.75} />
      <blockquote className="text-foreground mt-6 text-xl leading-relaxed font-medium text-balance sm:text-2xl">
        &ldquo;{FOUNDER_QUOTE.text}&rdquo;
      </blockquote>
      <div className="mt-8 flex items-center justify-center gap-3">
        <img
          src="/about/team-owner.png"
          alt={FOUNDER_QUOTE.name}
          className="h-11 w-11 rounded-full object-cover grayscale"
        />
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
