"use client"

import { useEffect, useState } from "react"
import { createPortal } from "react-dom"
import Link from "next/link"
import { Heart, Lock, MapPin, Package, User, X } from "lucide-react"
import { cn } from "@/lib/utils"

const NAV_LINKS = [
  { href: "/", label: "Home" },
  { href: "/products", label: "Products" },
  { href: "/about", label: "About" },
]

const ACCOUNT_SHORTCUTS = [
  { href: "/profile", label: "Update Address", icon: MapPin },
  { href: "/tracking", label: "Track Order", icon: Package },
  { href: "/profile", label: "Update Password", icon: Lock },
  { href: "/profile", label: "My Profile", icon: User },
]

interface MobileNavProps {
  open: boolean
  onClose: () => void
  pathname: string
  profileName: string
  profileEmail: string
  wishlistCount: number
}

export function MobileNav({
  open,
  onClose,
  pathname,
  profileName,
  profileEmail,
  wishlistCount,
}: MobileNavProps) {
  const [mounted, setMounted] = useState(false)
  useEffect(() => {
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
      <button
        type="button"
        aria-label="Close menu"
        onClick={onClose}
        className={cn(
          "bg-foreground/40 absolute inset-0 backdrop-blur-sm transition-opacity duration-300",
          open ? "opacity-100" : "opacity-0",
        )}
      />

      <div
        role="dialog"
        aria-modal="true"
        aria-label="Menu"
        className={cn(
          "bg-background absolute top-0 right-0 flex h-dvh w-[84%] max-w-sm flex-col shadow-2xl transition-transform duration-300 ease-out",
          open ? "translate-x-0" : "translate-x-full",
        )}
      >
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
          <Link
            href="/profile"
            onClick={onClose}
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
          </Link>

          <nav className="px-3 py-3">
            <p className="text-muted-foreground px-2 pb-1.5 text-[11px] font-semibold tracking-wider uppercase">
              Browse
            </p>
            <ul className="flex flex-col">
              {NAV_LINKS.map((link) => {
                const active =
                  link.href === "/"
                    ? pathname === "/"
                    : pathname.startsWith(link.href)
                return (
                  <li key={link.href}>
                    <Link
                      href={link.href}
                      onClick={onClose}
                      className={cn(
                        "block w-full rounded-md px-3 py-3 text-left text-sm transition-colors",
                        active
                          ? "bg-accent-violet/10 text-accent-violet font-medium"
                          : "text-muted-foreground hover:bg-muted hover:text-foreground",
                      )}
                    >
                      {link.label}
                    </Link>
                  </li>
                )
              })}
            </ul>
          </nav>

          <nav className="border-border border-t px-3 py-3">
            <p className="text-muted-foreground px-2 pb-1.5 text-[11px] font-semibold tracking-wider uppercase">
              My Account
            </p>
            <ul className="flex flex-col">
              <li>
                <NavDrawerRow
                  href="/wishlist"
                  icon={Heart}
                  label="My Wishlist"
                  badge={wishlistCount}
                  onClick={onClose}
                />
              </li>
              {ACCOUNT_SHORTCUTS.map((s) => (
                <li key={s.label}>
                  <NavDrawerRow
                    href={s.href}
                    icon={s.icon}
                    label={s.label}
                    onClick={onClose}
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

function NavDrawerRow({
  href,
  icon: Icon,
  label,
  badge,
  onClick,
}: {
  href: string
  icon: typeof MapPin
  label: string
  badge?: number
  onClick: () => void
}) {
  return (
    <Link
      href={href}
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
    </Link>
  )
}
