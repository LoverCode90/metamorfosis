"use client"

import { useState } from "react"
import { Heart, Menu, Search, ShoppingBag, User, X } from "lucide-react"
import type { StoreView } from "@/lib/checkout"
import { cn } from "@/lib/utils"
import { useCart } from "./cart-context"

const NAV_LINKS: { id: StoreView; label: string }[] = [
  { id: "home", label: "Home" },
  { id: "products", label: "Products" },
  { id: "academy", label: "Academy" },
  { id: "about", label: "About" },
]

export function StoreHeader() {
  const { view, setView, totals, wishlist } = useCart()
  const [mobileOpen, setMobileOpen] = useState(false)

  function go(next: StoreView) {
    setView(next)
    setMobileOpen(false)
  }

  return (
    <header className="sticky top-0 z-40 border-b border-border bg-background/85 backdrop-blur supports-[backdrop-filter]:bg-background/70">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between gap-4 px-4 sm:px-6">
        {/* Brand */}
        <button
          type="button"
          onClick={() => go("home")}
          className="flex shrink-0 items-center gap-2"
          aria-label="Metamorfosis Lab home"
        >
          <span className="flex h-7 w-7 items-center justify-center rounded-sm bg-foreground text-background">
            <ShoppingBag className="h-3.5 w-3.5" strokeWidth={2.25} />
          </span>
          <span className="text-sm font-semibold tracking-[0.18em] text-foreground">
            METAMORFOSIS
          </span>
        </button>

        {/* Center nav (desktop) */}
        <nav className="hidden items-center gap-8 md:flex">
          {NAV_LINKS.map((link) => {
            const active = view === link.id
            return (
              <button
                key={link.id}
                type="button"
                onClick={() => go(link.id)}
                className={cn(
                  "relative text-sm transition-colors",
                  active
                    ? "font-medium text-foreground"
                    : "text-muted-foreground hover:text-foreground",
                )}
              >
                {link.label}
                {active && (
                  <span className="absolute -bottom-[21px] left-0 h-px w-full bg-foreground" />
                )}
              </button>
            )
          })}
        </nav>

        {/* Action icons */}
        <div className="flex items-center gap-1 sm:gap-2">
          <IconButton label="Search" className="hidden sm:flex">
            <Search className="h-5 w-5" strokeWidth={1.75} />
          </IconButton>

          <IconButton label="Wishlist" badge={wishlist.length} className="hidden sm:flex">
            <Heart className="h-5 w-5" strokeWidth={1.75} />
          </IconButton>

          <IconButton
            label="Shopping bag"
            badge={totals.itemCount}
            onClick={() => go("cart")}
            active={view === "cart" || view === "checkout"}
          >
            <ShoppingBag className="h-5 w-5" strokeWidth={1.75} />
          </IconButton>

          <IconButton label="Profile" className="hidden sm:flex">
            <User className="h-5 w-5" strokeWidth={1.75} />
          </IconButton>

          {/* Mobile menu toggle */}
          <button
            type="button"
            onClick={() => setMobileOpen((o) => !o)}
            aria-label={mobileOpen ? "Close menu" : "Open menu"}
            aria-expanded={mobileOpen}
            className="ml-1 flex h-9 w-9 items-center justify-center rounded-md text-foreground transition-colors hover:bg-muted md:hidden"
          >
            {mobileOpen ? (
              <X className="h-5 w-5" strokeWidth={1.75} />
            ) : (
              <Menu className="h-5 w-5" strokeWidth={1.75} />
            )}
          </button>
        </div>
      </div>

      {/* Mobile nav drawer */}
      {mobileOpen && (
        <nav className="border-t border-border bg-background md:hidden">
          <ul className="mx-auto flex max-w-6xl flex-col px-4 py-2 sm:px-6">
            {NAV_LINKS.map((link) => {
              const active = view === link.id
              return (
                <li key={link.id}>
                  <button
                    type="button"
                    onClick={() => go(link.id)}
                    className={cn(
                      "w-full rounded-md px-2 py-3 text-left text-sm transition-colors",
                      active
                        ? "font-medium text-foreground"
                        : "text-muted-foreground hover:bg-muted hover:text-foreground",
                    )}
                  >
                    {link.label}
                  </button>
                </li>
              )
            })}
          </ul>
        </nav>
      )}
    </header>
  )
}

interface IconButtonProps {
  label: string
  children: React.ReactNode
  badge?: number
  onClick?: () => void
  active?: boolean
  className?: string
}

function IconButton({ label, children, badge, onClick, active, className }: IconButtonProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={label}
      className={cn(
        "relative flex h-9 w-9 items-center justify-center rounded-md transition-colors",
        active
          ? "bg-muted text-foreground"
          : "text-foreground hover:bg-muted",
        className,
      )}
    >
      {children}
      {badge !== undefined && badge > 0 && (
        <span className="absolute -right-0.5 -top-0.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-foreground px-1 text-[10px] font-semibold text-background">
          {badge}
        </span>
      )}
    </button>
  )
}
