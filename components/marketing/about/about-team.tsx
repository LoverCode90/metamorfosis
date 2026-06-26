/* eslint-disable @next/next/no-img-element */
import { TEAM } from "@/lib/marketing/about-content"

/** "Meet the team" section with a responsive member grid. */
export function AboutTeam() {
  return (
    <section>
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-muted-foreground text-xs font-medium tracking-[0.3em] uppercase">
            Our team
          </p>
          <h2 className="text-foreground mt-3 text-2xl font-semibold tracking-tight sm:text-3xl">
            Meet the team
          </h2>
        </div>
        <p className="text-muted-foreground max-w-md text-sm leading-relaxed">
          A close-knit studio led by a cosmetology master and powered by
          stylists who live and breathe the craft of color.
        </p>
      </div>

      <div className="mt-10 grid grid-cols-1 gap-5 sm:grid-cols-3">
        {TEAM.map((member) => (
          <article
            key={member.name}
            className="group border-border bg-card hover:border-foreground/30 overflow-hidden rounded-xl border transition-colors"
          >
            <div className="bg-muted aspect-[4/5] overflow-hidden">
              <img
                src={member.image || "/placeholder.svg"}
                alt={member.name}
                className="h-full w-full object-cover grayscale transition-transform duration-500 group-hover:scale-[1.03]"
              />
            </div>
            <div className="p-5 text-center">
              <h3 className="text-foreground text-base font-semibold">
                {member.name}
              </h3>
              <p className="text-muted-foreground mt-1 text-sm">
                {member.role}
              </p>
            </div>
          </article>
        ))}
      </div>
    </section>
  )
}
