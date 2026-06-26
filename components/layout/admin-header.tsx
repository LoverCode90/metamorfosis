"use client"

import Link from "next/link"
import { Menu, ShieldCheck } from "lucide-react"

import { Button } from "@/components/ui/button"
import { ADMIN_NAV_LINKS, isNavLinkActive } from "@/lib/layout/nav"
import { cn } from "@/lib/utils"

interface AdminHeaderProps {
  pathname: string
  onOpenMenu: () => void
}

/** Top navigation bar shown to admin users. */
export function AdminHeader({ pathname, onOpenMenu }: AdminHeaderProps) {
  return (
    <header className="border-border bg-background/85 supports-[backdrop-filter]:bg-background/70 sticky top-0 z-40 border-b backdrop-blur">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between gap-4 px-4 sm:px-6">
        <Link
          href="/admin"
          className="flex shrink-0 items-center gap-2"
          aria-label="Metamorfosis admin home"
        >
          <span className="bg-accent-violet text-background flex h-7 w-7 items-center justify-center rounded-sm">
            <ShieldCheck className="h-3.5 w-3.5" strokeWidth={2.25} />
          </span>
          <span className="text-foreground text-sm font-semibold tracking-[0.18em]">
            METAMORFOSIS · ADMIN
          </span>
        </Link>

        <nav className="hidden items-center gap-1 md:flex">
          {ADMIN_NAV_LINKS.map(({ href, label, icon: Icon }) => {
            const active = isNavLinkActive(href, pathname)
            const linkClass = cn(
              "inline-flex h-9 items-center gap-2 rounded-md px-3 text-sm font-medium transition-colors",
              active
                ? "bg-foreground/10 text-foreground"
                : "text-muted-foreground hover:bg-foreground/5 hover:text-foreground",
            )
            return (
              <Link key={href} href={href} className={linkClass}>
                <Icon className="h-4 w-4" strokeWidth={1.75} />
                {label}
              </Link>
            )
          })}
        </nav>

        <Button
          variant="ghost"
          size="icon-sm"
          onClick={onOpenMenu}
          aria-label="Open menu"
          className="ml-1 h-9 w-9 md:hidden"
        >
          <Menu className="h-5 w-5" strokeWidth={1.75} />
        </Button>
      </div>
    </header>
  )
}
