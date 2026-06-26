"use client"

import { useEffect, useState } from "react"
import { createPortal } from "react-dom"
import { Heart, Lock, MapPin, Package, User, X } from "lucide-react"

import { Button } from "@/components/ui/button"
import {
  MobileNavLink,
  MobileNavProfileHeader,
  NavDrawerRow,
} from "@/components/layout/mobile-nav-link"
import { CUSTOMER_NAV_LINKS, isNavLinkActive } from "@/lib/layout/nav"
import { cn } from "@/lib/utils"

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

  const backdropClass = cn(
    "bg-foreground/40 absolute inset-0 backdrop-blur-sm transition-opacity duration-300",
    open ? "opacity-100" : "opacity-0",
  )
  const panelClass = cn(
    "bg-background absolute top-0 right-0 flex h-dvh w-[84%] max-w-sm flex-col shadow-2xl transition-transform duration-300 ease-out",
    open ? "translate-x-0" : "translate-x-full",
  )

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
        className={backdropClass}
      />

      <div
        role="dialog"
        aria-modal="true"
        aria-label="Menu"
        className={panelClass}
      >
        <div className="border-border flex items-center justify-between border-b px-5 py-4">
          <span className="text-foreground text-sm font-semibold tracking-[0.18em]">
            MENU
          </span>
          <Button
            variant="ghost"
            size="icon-sm"
            onClick={onClose}
            aria-label="Close menu"
            className="h-9 w-9"
          >
            <X className="h-5 w-5" strokeWidth={1.75} />
          </Button>
        </div>

        <div className="flex-1 overflow-y-auto">
          <MobileNavProfileHeader
            name={profileName}
            email={profileEmail}
            onClick={onClose}
          />

          <nav className="px-3 py-3">
            <p className="text-muted-foreground px-2 pb-1.5 text-[11px] font-semibold tracking-wider uppercase">
              Browse
            </p>
            <ul className="flex flex-col">
              {CUSTOMER_NAV_LINKS.map((link) => (
                <li key={link.href}>
                  <MobileNavLink
                    href={link.href}
                    label={link.label}
                    active={isNavLinkActive(link.href, pathname)}
                    onClick={onClose}
                  />
                </li>
              ))}
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
              {ACCOUNT_SHORTCUTS.map((shortcut) => (
                <li key={shortcut.label}>
                  <NavDrawerRow
                    href={shortcut.href}
                    icon={shortcut.icon}
                    label={shortcut.label}
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
