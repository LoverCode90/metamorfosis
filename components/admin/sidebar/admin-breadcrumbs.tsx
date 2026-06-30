"use client"

import Link from "next/link"
import { useMemo } from "react"
import { usePathname } from "next/navigation"

import { buildAdminBreadcrumbSegments } from "@/lib/admin/nav-config"
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb"

/** Dynamic breadcrumbs derived from the current admin route. */
export function AdminBreadcrumbs() {
  const currentPathname = usePathname()

  const breadcrumbSegments = useMemo(
    () => buildAdminBreadcrumbSegments(currentPathname),
    [currentPathname],
  )

  return (
    <Breadcrumb>
      <BreadcrumbList>
        {breadcrumbSegments.map((segment, segmentIndex) => {
          const isLastSegment = segmentIndex === breadcrumbSegments.length - 1

          return (
            <span key={`${segment.label}-${segmentIndex}`} className="contents">
              {segmentIndex > 0 && (
                <BreadcrumbSeparator className="hidden md:block" />
              )}
              <BreadcrumbItem
                className={segmentIndex === 0 ? "hidden md:block" : undefined}
              >
                {isLastSegment || !segment.href ? (
                  <BreadcrumbPage>{segment.label}</BreadcrumbPage>
                ) : (
                  <BreadcrumbLink render={<Link href={segment.href} />}>
                    {segment.label}
                  </BreadcrumbLink>
                )}
              </BreadcrumbItem>
            </span>
          )
        })}
      </BreadcrumbList>
    </Breadcrumb>
  )
}
