"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { ClipboardList, ShieldCheck, ShoppingBag } from "lucide-react"
import { cn } from "@/lib/utils"

const NAV_ITEMS = [
  {
    label: "Verifications",
    href: "/admin/verifications",
    icon: ShieldCheck,
    enabled: true,
    badgeKey: "verifications" as const,
  },
  {
    label: "Orders",
    href: "/admin/orders",
    icon: ShoppingBag,
    enabled: false, // Phase 8+
    badgeKey: null,
  },
  {
    label: "Cases",
    href: "/admin/cases",
    icon: ClipboardList,
    enabled: false, // Phase 8
    badgeKey: null,
  },
]

export function AdminNav({ pendingCount = 0 }: { pendingCount?: number }) {
  const pathname = usePathname()

  return (
    <nav className="flex items-center gap-1">
      {NAV_ITEMS.map(({ label, href, icon: Icon, enabled, badgeKey }) =>
        enabled ? (
          <Link
            key={href}
            href={href}
            className={cn(
              "inline-flex h-9 items-center gap-2 rounded-md px-3 text-sm font-medium transition-colors",
              pathname.startsWith(href)
                ? "bg-foreground/10 text-foreground"
                : "text-muted-foreground hover:bg-foreground/5 hover:text-foreground",
            )}
          >
            <Icon className="h-4 w-4" strokeWidth={1.75} />
            {label}
            {badgeKey === "verifications" && pendingCount > 0 && (
              <span className="flex h-4 min-w-4 items-center justify-center rounded-full bg-amber-500 px-1 text-[10px] leading-none font-semibold text-white">
                {pendingCount > 99 ? "99+" : pendingCount}
              </span>
            )}
          </Link>
        ) : (
          <span
            key={href}
            title="Coming soon"
            className="text-muted-foreground/40 inline-flex h-9 cursor-not-allowed items-center gap-2 rounded-md px-3 text-sm font-medium"
          >
            <Icon className="h-4 w-4" strokeWidth={1.75} />
            {label}
          </span>
        ),
      )}
    </nav>
  )
}
