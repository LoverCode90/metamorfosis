import Link from "next/link"
import { ArrowRight } from "lucide-react"

import { cn } from "@/lib/utils"

export interface Kit {
  tag: string
  title: string
  items: string[]
  dark: boolean
}

type KitTone = "dark" | "light"

const KIT_SURFACE: Record<KitTone, string> = {
  dark: "bg-foreground",
  light: "bg-card",
}
const KIT_TAG: Record<KitTone, string> = {
  dark: "text-white/45",
  light: "text-muted-foreground",
}
const KIT_TITLE: Record<KitTone, string> = {
  dark: "text-white",
  light: "text-foreground",
}
const KIT_ITEM: Record<KitTone, string> = {
  dark: "text-white/60",
  light: "text-muted-foreground",
}
const KIT_CTA: Record<KitTone, string> = {
  dark: "text-white/70",
  light: "text-foreground/70",
}

/** A single ready-to-work kit card. */
export function KitCard({ kit }: { kit: Kit }) {
  const tone: KitTone = kit.dark ? "dark" : "light"

  return (
    <Link
      href="/products"
      className={cn(
        "group flex flex-col justify-between p-8 text-left transition-opacity hover:opacity-90",
        KIT_SURFACE[tone],
      )}
    >
      <div>
        <span
          className={cn(
            "text-[11px] font-bold tracking-[0.2em] uppercase",
            KIT_TAG[tone],
          )}
        >
          {kit.tag}
        </span>
        <h3
          className={cn(
            "mt-3 text-xl font-semibold tracking-tight",
            KIT_TITLE[tone],
          )}
        >
          {kit.title}
        </h3>
        <ul className="mt-4 flex flex-col gap-1.5">
          {kit.items.map((item) => (
            <li
              key={item}
              className={cn("flex items-start gap-2 text-sm", KIT_ITEM[tone])}
            >
              <span className="mt-[5px] h-1 w-1 shrink-0 rounded-full bg-current opacity-50" />
              {item}
            </li>
          ))}
        </ul>
      </div>
      <span
        className={cn(
          "mt-8 inline-flex items-center gap-1.5 text-xs font-semibold transition-[gap] group-hover:gap-2",
          KIT_CTA[tone],
        )}
      >
        View kit <ArrowRight className="h-3.5 w-3.5" strokeWidth={2} />
      </span>
    </Link>
  )
}
