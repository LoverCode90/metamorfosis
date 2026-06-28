import { HomeBrandLines } from "@/components/marketing/home-brand-lines"
import { HomeFooter } from "@/components/marketing/home-footer"
import { HomeHero } from "@/components/marketing/home-hero"

/** Marketing home page composed of self-contained sections. */
export function HomePage() {
  return (
    <div className="flex flex-col gap-y-24">
      <HomeHero />
      <HomeBrandLines />
      <HomeFooter />
    </div>
  )
}
