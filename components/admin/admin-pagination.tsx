import Link from "next/link"

import { cn } from "@/lib/utils"

interface AdminPaginationProps {
  basePath: string
  page: number
  totalPages: number
  /** Extra query params to preserve across page links (e.g. status). */
  params?: Record<string, string | undefined>
}

function buildHref(
  basePath: string,
  page: number,
  params?: Record<string, string | undefined>,
): string {
  const search = new URLSearchParams()
  for (const [key, value] of Object.entries(params ?? {})) {
    if (value) search.set(key, value)
  }
  search.set("page", String(page))
  return `${basePath}?${search.toString()}`
}

/** Prev/next pagination for admin list tables. */
export function AdminPagination({
  basePath,
  page,
  totalPages,
  params,
}: AdminPaginationProps) {
  if (totalPages <= 1) return null

  const linkClass =
    "border-border rounded-md border px-3 py-1.5 text-sm font-medium transition-colors hover:bg-muted"
  const disabledClass = "pointer-events-none opacity-40"

  return (
    <div className="flex items-center justify-between">
      <Link
        href={buildHref(basePath, page - 1, params)}
        className={cn(linkClass, page <= 1 && disabledClass)}
        aria-disabled={page <= 1}
      >
        Previous
      </Link>
      <span className="text-muted-foreground text-sm">
        Page {page} of {totalPages}
      </span>
      <Link
        href={buildHref(basePath, page + 1, params)}
        className={cn(linkClass, page >= totalPages && disabledClass)}
        aria-disabled={page >= totalPages}
      >
        Next
      </Link>
    </div>
  )
}
