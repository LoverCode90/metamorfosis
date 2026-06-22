"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import {
  ClipboardList,
  LayoutDashboard,
  Settings,
  ShieldCheck,
  ShoppingBag,
} from "lucide-react"
import { cn } from "@/lib/utils"

const NAV_ITEMS = [
  {
    label: "Dashboard",
    href: "/admin",
    icon: LayoutDashboard,
    enabled: true,
    exact: true,
    badgeKey: null,
  },
  {
    label: "Verifications",
    href: "/admin/verifications",
    icon: ShieldCheck,
    enabled: true,
    exact: false,
    badgeKey: "verifications" as const,
  },
  {
    label: "Orders",
    href: "/admin/orders",
    icon: ShoppingBag,
    enabled: false, // Phase 8+
    exact: false,
    badgeKey: null,
  },
  {
    label: "Cases",
    href: "/admin/cases",
    icon: ClipboardList,
    enabled: false, // Phase 8
    exact: false,
    badgeKey: null,
  },
  {
    label: "Settings",
    href: "/admin/settings",
    icon: Settings,
    enabled: true,
    exact: false,
    badgeKey: null,
  },
]

export function AdminNav({ pendingCount = 0 }: { pendingCount?: number }) {
  const pathname = usePathname()

  return (
    <nav className="flex min-w-0 items-center gap-0.5 sm:gap-1">
      {NAV_ITEMS.map(
        ({ label, href, icon: Icon, enabled, exact, badgeKey }) => {
          const active = exact ? pathname === href : pathname.startsWith(href)

          if (!enabled) {
            return (
              <span
                key={href}
                title="Coming soon"
                className="text-muted-foreground/40 inline-flex h-9 cursor-not-allowed items-center gap-2 rounded-md px-2.5 text-sm font-medium sm:px-3"
              >
                <Icon className="h-4 w-4 shrink-0" strokeWidth={1.75} />
                <span className="hidden lg:inline">{label}</span>
              </span>
            )
          }

          return (
            <Link
              key={href}
              href={href}
              aria-label={label}
              className={cn(
                "inline-flex h-9 items-center gap-2 rounded-md px-2.5 text-sm font-medium transition-colors sm:px-3",
                active
                  ? "bg-foreground/10 text-foreground"
                  : "text-muted-foreground hover:bg-foreground/5 hover:text-foreground",
              )}
            >
              <Icon className="h-4 w-4 shrink-0" strokeWidth={1.75} />
              <span className="hidden lg:inline">{label}</span>
              {badgeKey === "verifications" && pendingCount > 0 && (
                <span className="flex h-4 min-w-4 items-center justify-center rounded-full bg-amber-500 px-1 text-[10px] leading-none font-semibold text-white">
                  {pendingCount > 99 ? "99+" : pendingCount}
                </span>
              )}
            </Link>
          )
        },
      )}
    </nav>
  )
}
