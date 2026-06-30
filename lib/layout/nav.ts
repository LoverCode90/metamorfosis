import { Lock, MapPin, Package, User } from "lucide-react"
import type { LucideIcon } from "lucide-react"

import { ADMIN_PANEL_NAV_ITEMS } from "@/lib/admin/nav-config"

export interface NavLink {
  href: string
  label: string
}

export interface AdminNavLink extends NavLink {
  icon: LucideIcon
}

/** Primary customer-facing navigation links. */
export const CUSTOMER_NAV_LINKS: NavLink[] = [
  { href: "/", label: "Home" },
  { href: "/products", label: "Products" },
  { href: "/about", label: "About" },
]

/** Admin dashboard navigation links (shop-context header). */
export const ADMIN_NAV_LINKS: AdminNavLink[] = ADMIN_PANEL_NAV_ITEMS.filter(
  (item) => item.href !== "/admin/settings",
).map((item) => ({
  href: item.href,
  label: item.label,
  icon: item.icon,
}))

/**
 * Whether a nav link is active for the current path. The root/dashboard links
 * match exactly; others match by prefix.
 */
export function isNavLinkActive(href: string, pathname: string): boolean {
  if (href === "/" || href === "/admin") return pathname === href
  return pathname.startsWith(href)
}

export interface NavShortcut {
  href: string
  label: string
  icon: LucideIcon
}

const ACCOUNT_SHORTCUTS: NavShortcut[] = [
  { href: "/profile/addresses", label: "Update Address", icon: MapPin },
  { href: "/orders", label: "My Orders", icon: Package },
  { href: "/profile/security", label: "Update Password", icon: Lock },
  { href: "/profile", label: "My Profile", icon: User },
]

/** Returns account shortcuts, omitting the password entry for Google OAuth users. */
export function getAccountShortcuts(isGoogleUser: boolean): NavShortcut[] {
  return isGoogleUser
    ? ACCOUNT_SHORTCUTS.filter(
        (shortcut) => shortcut.href !== "/profile/security",
      )
    : ACCOUNT_SHORTCUTS
}
