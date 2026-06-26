import Link from "next/link"

import { CUSTOMER_NAV_LINKS, isNavLinkActive } from "@/lib/layout/nav"
import { cn } from "@/lib/utils"

/** Desktop customer navigation links with an active-link underline. */
export function CustomerNav({ pathname }: { pathname: string }) {
  return (
    <nav className="hidden items-center gap-8 md:flex">
      {CUSTOMER_NAV_LINKS.map((link) => {
        const active = isNavLinkActive(link.href, pathname)
        const linkClass = cn(
          "relative text-sm transition-colors",
          active
            ? "text-accent-violet font-medium"
            : "text-muted-foreground hover:text-foreground",
        )
        return (
          <Link key={link.href} href={link.href} className={linkClass}>
            {link.label}
            {active && (
              <span className="bg-accent-violet absolute -bottom-[21px] left-0 h-px w-full" />
            )}
          </Link>
        )
      })}
    </nav>
  )
}
