import { AboutComparison } from "@/components/marketing/about/about-comparison"
import { AboutFaqs } from "@/components/marketing/about/about-faqs"
import { AboutHero } from "@/components/marketing/about/about-hero"
import { AboutQuote } from "@/components/marketing/about/about-quote"
/** Marketing "About" page composed of self-contained content sections. */
export function AboutPage() {
  return (
    <div className="mx-auto max-w-6xl px-4 py-12 sm:px-6 sm:py-16 lg:py-20">
      <AboutHero />
      <AboutQuote />
      <AboutComparison />
      <AboutFaqs />
    </div>
    // Hello World
  )
}
