import {
  ClipboardList,
  ExternalLink,
  LayoutDashboard,
  Settings,
  ShieldCheck,
  ShoppingBag,
  Store,
} from "lucide-react"
import type { LucideIcon } from "lucide-react"

export type AdminNavBadgeKey = "verifications"

export interface AdminPanelNavItem {
  label: string
  href: string
  icon: LucideIcon
  exactMatch: boolean
  badgeKey: AdminNavBadgeKey | null
  enabled: boolean
}

export interface AdminQuickLinkItem {
  label: string
  href: string
  icon: LucideIcon
  opensInNewTab: boolean
}

/** Primary admin sidebar navigation — single source of truth. */
export const ADMIN_PANEL_NAV_ITEMS: AdminPanelNavItem[] = [
  {
    label: "Dashboard",
    href: "/admin",
    icon: LayoutDashboard,
    exactMatch: true,
    badgeKey: null,
    enabled: true,
  },
  {
    label: "Verifications",
    href: "/admin/verifications",
    icon: ShieldCheck,
    exactMatch: false,
    badgeKey: "verifications",
    enabled: true,
  },
  {
    label: "Orders",
    href: "/admin/orders",
    icon: ShoppingBag,
    exactMatch: false,
    badgeKey: null,
    enabled: true,
  },
  {
    label: "Cases",
    href: "/admin/cases",
    icon: ClipboardList,
    exactMatch: false,
    badgeKey: null,
    enabled: true,
  },
  {
    label: "Settings",
    href: "/admin/settings",
    icon: Settings,
    exactMatch: false,
    badgeKey: null,
    enabled: true,
  },
]

/** Secondary shortcuts shown below the main nav. */
export const ADMIN_QUICK_LINK_ITEMS: AdminQuickLinkItem[] = [
  {
    label: "View storefront",
    href: "/",
    icon: Store,
    opensInNewTab: false,
  },
  {
    label: "Square dashboard",
    href: "https://squareup.com/dashboard",
    icon: ExternalLink,
    opensInNewTab: true,
  },
]

export function isAdminNavItemActive(
  navItem: AdminPanelNavItem,
  currentPathname: string,
): boolean {
  if (navItem.exactMatch) return currentPathname === navItem.href
  return currentPathname.startsWith(navItem.href)
}

export interface AdminBreadcrumbSegment {
  label: string
  href: string | null
}

const ADMIN_ROUTE_LABELS: Record<string, string> = {
  admin: "Dashboard",
  verifications: "Verifications",
  orders: "Orders",
  cases: "Cases",
  settings: "Settings",
  "packing-slip": "Packing slip",
}

/** Builds breadcrumb segments from an admin pathname. */
export function buildAdminBreadcrumbSegments(
  pathname: string,
): AdminBreadcrumbSegment[] {
  const pathSegments = pathname.split("/").filter(Boolean)
  if (pathSegments.length === 0 || pathSegments[0] !== "admin") {
    return [{ label: "Dashboard", href: "/admin" }]
  }

  const breadcrumbSegments: AdminBreadcrumbSegment[] = [
    { label: "Admin", href: "/admin" },
  ]

  if (pathSegments.length === 1) {
    return [{ label: "Dashboard", href: null }]
  }

  const sectionKey = pathSegments[1]
  const sectionLabel = ADMIN_ROUTE_LABELS[sectionKey] ?? sectionKey
  const sectionHref = `/admin/${sectionKey}`

  if (pathSegments.length === 2) {
    breadcrumbSegments.push({ label: sectionLabel, href: null })
    return breadcrumbSegments
  }

  breadcrumbSegments.push({ label: sectionLabel, href: sectionHref })

  const detailSegment = pathSegments[2]
  if (detailSegment === "packing-slip") {
    breadcrumbSegments.push({ label: "Packing slip", href: null })
    return breadcrumbSegments
  }

  if (sectionKey === "orders" || sectionKey === "cases") {
    const shortId = detailSegment.slice(0, 8).toUpperCase()
    breadcrumbSegments.push({
      label: `${sectionLabel.slice(0, -1)} #${shortId}`,
      href: null,
    })
    return breadcrumbSegments
  }

  breadcrumbSegments.push({
    label: ADMIN_ROUTE_LABELS[detailSegment] ?? detailSegment,
    href: null,
  })

  return breadcrumbSegments
}

/** Routes that render without the admin sidebar chrome (print views). */
export function isAdminChromelessRoute(pathname: string): boolean {
  return pathname.includes("/packing-slip")
}
