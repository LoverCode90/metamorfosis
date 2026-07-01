export interface AdminBreadcrumbSegment {
  label: string
  href: string | null
}

const ADMIN_ROUTE_LABELS: Record<string, string> = {
  admin: "Dashboard",
  verifications: "Verifications",
  orders: "Orders",
  "store-pickups": "Customer pickups",
  cases: "Cases",
  settings: "Settings",
  shipping: "Shipping",
  pickups: "Carrier pickup",
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
  const sectionHref =
    sectionKey === "shipping"
      ? "/admin/shipping/pickups"
      : `/admin/${sectionKey}`

  if (pathSegments.length === 2) {
    breadcrumbSegments.push({ label: sectionLabel, href: null })
    return breadcrumbSegments
  }

  if (sectionKey === "shipping" && pathSegments[2] === "pickups") {
    breadcrumbSegments.push({ label: sectionLabel, href: sectionHref })
    breadcrumbSegments.push({ label: "Carrier pickup", href: null })
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
