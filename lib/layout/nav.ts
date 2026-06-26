import {
  ClipboardList,
  LayoutDashboard,
  Lock,
  MapPin,
  Package,
  ShieldCheck,
  ShoppingBag,
  User,
} from "lucide-react"
import type { LucideIcon } from "lucide-react"

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

/** Admin dashboard navigation links. */
export const ADMIN_NAV_LINKS: AdminNavLink[] = [
  { href: "/admin", label: "Dashboard", icon: LayoutDashboard },
  { href: "/admin/verifications", label: "Verifications", icon: ShieldCheck },
  { href: "/admin/orders", label: "Orders", icon: ShoppingBag },
  { href: "/admin/cases", label: "Cases", icon: ClipboardList },
]

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
