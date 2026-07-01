import {
  ClipboardList,
  ExternalLink,
  LayoutDashboard,
  Settings,
  ShieldCheck,
  ShoppingBag,
  Store,
  Truck,
} from "lucide-react"
import type { LucideIcon } from "lucide-react"

export type { AdminBreadcrumbSegment } from "@/lib/admin/breadcrumbs"
export {
  buildAdminBreadcrumbSegments,
  isAdminChromelessRoute,
} from "@/lib/admin/breadcrumbs"

export type AdminNavBadgeKey = "verifications" | "storePickups"

export interface AdminNavBadgeCounts {
  verifications: number
  storePickups: number
}

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
    href: "/admin/orders?status=pending",
    icon: ShoppingBag,
    exactMatch: false,
    badgeKey: null,
    enabled: true,
  },
  {
    label: "Customer pickups",
    href: "/admin/store-pickups?tab=pending",
    icon: Store,
    exactMatch: false,
    badgeKey: "storePickups",
    enabled: true,
  },
  {
    label: "Cases",
    href: "/admin/cases?status=open",
    icon: ClipboardList,
    exactMatch: false,
    badgeKey: null,
    enabled: true,
  },
  {
    label: "Carrier pickup",
    href: "/admin/shipping/pickups",
    icon: Truck,
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
  const navPath = navItem.href.split("?")[0]
  if (navItem.exactMatch) return currentPathname === navPath
  return currentPathname.startsWith(navPath)
}
