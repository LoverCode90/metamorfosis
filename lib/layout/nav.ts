import {
  ClipboardList,
  LayoutDashboard,
  ShieldCheck,
  ShoppingBag,
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
 * @param href - The link target.
 * @param pathname - The current pathname.
 */
export function isNavLinkActive(href: string, pathname: string): boolean {
  if (href === "/" || href === "/admin") return pathname === href
  return pathname.startsWith(href)
}
