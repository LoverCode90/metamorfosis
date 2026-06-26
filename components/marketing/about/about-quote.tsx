/* eslint-disable @next/next/no-img-element */
import { Quote } from "lucide-react"

/** Founder testimonial pull-quote section. */
export function AboutQuote() {
  return (
    <section className="mx-auto max-w-3xl py-20 text-center sm:py-28">
      <Quote className="text-foreground mx-auto h-8 w-8" strokeWidth={1.75} />
      <blockquote className="text-foreground mt-6 text-xl leading-relaxed font-medium text-balance sm:text-2xl">
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
          <p className="text-foreground text-sm font-semibold">
            Sofia Marchetti
          </p>
          <p className="text-muted-foreground text-xs">Salon Owner & Founder</p>
        </div>
      </div>
    </section>
  )
}
