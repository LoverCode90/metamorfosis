"use client"

import { useEffect, useState } from "react"
import { createPortal } from "react-dom"
import {
  Heart,
  Lock,
  MapPin,
  Menu,
  Package,
  Search,
  ShoppingBag,
  User,
  X,
} from "lucide-react"
import type { StoreView } from "@/lib/checkout"
import { cn } from "@/lib/utils"
import { useCart } from "./cart-context"

const NAV_LINKS: { id: StoreView; label: string }[] = [
  { id: "home", label: "Home" },
  { id: "products", label: "Products" },
  { id: "about", label: "About" },
]

// Account shortcuts surfaced inside the mobile drawer.
const ACCOUNT_SHORTCUTS: {
  id: string
  label: string
  icon: typeof MapPin
  view: StoreView
}[] = [
  { id: "address", label: "Update Address", icon: MapPin, view: "profile" },
  { id: "orders", label: "Track Order", icon: Package, view: "tracking" },
  { id: "password", label: "Update Password", icon: Lock, view: "profile" },
  { id: "profile", label: "My Profile", icon: User, view: "profile" },
]

export function StoreHeader() {
  const { view, setView, totals, wishlist, profile } = useCart()
  const [mobileOpen, setMobileOpen] = useState(false)

  // Lock body scroll while the drawer is open.
  useEffect(() => {
    document.body.style.overflow = mobileOpen ? "hidden" : ""
    return () => {
      document.body.style.overflow = ""
    }
  }, [mobileOpen])

  function go(next: StoreView) {
    setView(next)
    setMobileOpen(false)
  }

  return (
    <header className="border-border bg-background/85 supports-[backdrop-filter]:bg-background/70 sticky top-0 z-40 border-b backdrop-blur">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between gap-4 px-4 sm:px-6">
        {/* Brand */}
        <button
          type="button"
          onClick={() => go("home")}
          className="flex shrink-0 items-center gap-2"
          aria-label="Metamorfosis Lab home"
        >
          <span className="bg-foreground text-background flex h-7 w-7 items-center justify-center rounded-sm">
            <ShoppingBag className="h-3.5 w-3.5" strokeWidth={2.25} />
          </span>
          <span className="text-foreground text-sm font-semibold tracking-[0.18em]">
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
                    ? "text-foreground font-medium"
                    : "text-muted-foreground hover:text-foreground",
                )}
              >
                {link.label}
                {active && (
                  <span className="bg-foreground absolute -bottom-[21px] left-0 h-px w-full" />
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

          <IconButton
            label="Wishlist"
            badge={wishlist.length}
            onClick={() => go("wishlist")}
            active={view === "wishlist"}
            className="hidden sm:flex"
          >
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

          <button
            type="button"
            onClick={() => go("login")}
            className="border-border text-foreground hover:bg-muted hidden items-center gap-1.5 rounded-md border px-3 py-1.5 text-xs font-semibold transition-colors sm:flex"
          >
            Sign in
          </button>

          <IconButton
            label="Profile"
            onClick={() => go("profile")}
            active={view === "profile"}
            className="hidden sm:flex"
          >
            <User className="h-5 w-5" strokeWidth={1.75} />
          </IconButton>

          {/* Mobile menu toggle */}
          <button
            type="button"
            onClick={() => setMobileOpen(true)}
            aria-label="Open menu"
            aria-expanded={mobileOpen}
            className="text-foreground hover:bg-muted ml-1 flex h-9 w-9 items-center justify-center rounded-md transition-colors md:hidden"
          >
            <Menu className="h-5 w-5" strokeWidth={1.75} />
          </button>
        </div>
      </div>

      <MobileDrawer
        open={mobileOpen}
        onClose={() => setMobileOpen(false)}
        view={view}
        go={go}
        profileName={profile.name}
        profileEmail={profile.email}
        wishlistCount={wishlist.length}
      />
    </header>
  )
}

// ---------------------------------------------------------------------------
// Tactile slide-out drawer with overlay + account shortcuts.
// ---------------------------------------------------------------------------
interface MobileDrawerProps {
  open: boolean
  onClose: () => void
  view: StoreView
  go: (v: StoreView) => void
  profileName: string
  profileEmail: string
  wishlistCount: number
}

function MobileDrawer({
  open,
  onClose,
  view,
  go,
  profileName,
  profileEmail,
  wishlistCount,
}: MobileDrawerProps) {
  // Portal the drawer to <body> so it escapes the sticky header's stacking
  // context (backdrop-blur + z-index) and overlays the page without shifting it.
  const [mounted, setMounted] = useState(false)
  useEffect(() => {
    // Portal target must exist before render; defer to next frame.
    const frame = requestAnimationFrame(() => setMounted(true))
    return () => cancelAnimationFrame(frame)
  }, [])
  if (!mounted) return null

  return createPortal(
    <div
      className={cn(
        "fixed inset-0 z-[100] md:hidden",
        open ? "" : "pointer-events-none",
      )}
      aria-hidden={!open}
    >
      {/* Overlay */}
      <button
        type="button"
        aria-label="Close menu"
        onClick={onClose}
        className={cn(
          "bg-foreground/40 absolute inset-0 backdrop-blur-sm transition-opacity duration-300",
          open ? "opacity-100" : "opacity-0",
        )}
      />

      {/* Panel */}
      <div
        role="dialog"
        aria-modal="true"
        aria-label="Menu"
        className={cn(
          "bg-background absolute top-0 right-0 flex h-dvh w-[84%] max-w-sm flex-col shadow-2xl transition-transform duration-300 ease-out",
          open ? "translate-x-0" : "translate-x-full",
        )}
      >
        {/* Header */}
        <div className="border-border flex items-center justify-between border-b px-5 py-4">
          <span className="text-foreground text-sm font-semibold tracking-[0.18em]">
            MENU
          </span>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close menu"
            className="text-foreground hover:bg-muted flex h-9 w-9 items-center justify-center rounded-md transition-colors"
          >
            <X className="h-5 w-5" strokeWidth={1.75} />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto">
          {/* Account card */}
          <button
            type="button"
            onClick={() => go("profile")}
            className="border-border hover:bg-muted flex w-full items-center gap-3 border-b px-5 py-4 text-left transition-colors"
          >
            <span className="bg-foreground text-background flex h-11 w-11 items-center justify-center rounded-full">
              <User className="h-5 w-5" strokeWidth={1.75} />
            </span>
            <span className="min-w-0 flex-1">
              <span className="text-foreground block truncate text-sm font-semibold">
                {profileName}
              </span>
              <span className="text-muted-foreground block truncate text-xs">
                {profileEmail}
              </span>
            </span>
          </button>

          {/* Primary nav */}
          <nav className="px-3 py-3">
            <p className="text-muted-foreground px-2 pb-1.5 text-[11px] font-semibold tracking-wider uppercase">
              Browse
            </p>
            <ul className="flex flex-col">
              {NAV_LINKS.map((link) => {
                const active = view === link.id
                return (
                  <li key={link.id}>
                    <button
                      type="button"
                      onClick={() => go(link.id)}
                      className={cn(
                        "w-full rounded-md px-3 py-3 text-left text-sm transition-colors",
                        active
                          ? "bg-muted text-foreground font-medium"
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

          {/* Account shortcuts */}
          <nav className="border-border border-t px-3 py-3">
            <p className="text-muted-foreground px-2 pb-1.5 text-[11px] font-semibold tracking-wider uppercase">
              My Account
            </p>
            <ul className="flex flex-col">
              <li>
                <DrawerRow
                  icon={Heart}
                  label="My Wishlist"
                  badge={wishlistCount}
                  onClick={() => go("wishlist")}
                />
              </li>
              {ACCOUNT_SHORTCUTS.map((s) => (
                <li key={s.id}>
                  <DrawerRow
                    icon={s.icon}
                    label={s.label}
                    onClick={() => go(s.view)}
                  />
                </li>
              ))}
            </ul>
          </nav>
        </div>
      </div>
    </div>,
    document.body,
  )
}

function DrawerRow({
  icon: Icon,
  label,
  badge,
  onClick,
}: {
  icon: typeof MapPin
  label: string
  badge?: number
  onClick: () => void
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="text-foreground hover:bg-muted flex w-full items-center gap-3 rounded-md px-3 py-3 text-left text-sm transition-colors"
    >
      <Icon className="text-muted-foreground h-4 w-4" strokeWidth={1.75} />
      <span className="flex-1">{label}</span>
      {badge !== undefined && badge > 0 && (
        <span className="bg-foreground text-background flex h-5 min-w-5 items-center justify-center rounded-full px-1.5 text-[10px] font-semibold">
          {badge}
        </span>
      )}
    </button>
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

function IconButton({
  label,
  children,
  badge,
  onClick,
  active,
  className,
}: IconButtonProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={label}
      className={cn(
        "relative flex h-9 w-9 items-center justify-center rounded-md transition-colors",
        active ? "bg-muted text-foreground" : "text-foreground hover:bg-muted",
        className,
      )}
    >
      {children}
      {badge !== undefined && badge > 0 && (
        <span className="bg-foreground text-background absolute -top-0.5 -right-0.5 flex h-4 min-w-4 items-center justify-center rounded-full px-1 text-[10px] font-semibold">
          {badge}
        </span>
      )}
    </button>
  )
}
