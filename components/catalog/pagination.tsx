"use client"

import { ChevronLeft, ChevronRight } from "lucide-react"
import { cn } from "@/lib/utils"

interface PaginationProps {
  page: number
  pageCount: number
  onChange: (page: number) => void
}

/**
 * Returns at most 5 numbered page buttons. Always anchors to first and last
 * page; shows a 3-page window centred on the current page in between.
 */
function buildPages(page: number, pageCount: number): (number | "...")[] {
  if (pageCount <= 5) return Array.from({ length: pageCount }, (_, i) => i + 1)

  const lo = Math.max(2, Math.min(page - 1, pageCount - 3))
  const hi = Math.min(pageCount - 1, lo + 2)

  const pages: (number | "...")[] = [1]
  if (lo > 2) pages.push("...")
  for (let i = lo; i <= hi; i++) pages.push(i)
  if (hi < pageCount - 1) pages.push("...")
  pages.push(pageCount)

  return pages
}

export function Pagination({ page, pageCount, onChange }: PaginationProps) {
  if (pageCount <= 1) return null
  const pages = buildPages(page, pageCount)

  return (
    <nav
      className="flex items-center justify-center gap-1"
      aria-label="Pagination"
    >
      <NavArrow
        onClick={() => onChange(page - 1)}
        disabled={page === 1}
        ariaLabel="Previous page"
      >
        <ChevronLeft className="h-4 w-4" strokeWidth={2} />
      </NavArrow>

      {pages.map((p, i) =>
        p === "..." ? (
          <span
            key={`gap-${i}`}
            className="text-muted-foreground flex h-9 w-7 items-center justify-center text-sm select-none"
          >
            ··
          </span>
        ) : (
          <PageBtn
            key={p}
            onClick={() => onChange(p)}
            active={p === page}
            ariaLabel={`Page ${p}`}
          >
            {p}
          </PageBtn>
        ),
      )}

      <NavArrow
        onClick={() => onChange(page + 1)}
        disabled={page === pageCount}
        ariaLabel="Next page"
      >
        <ChevronRight className="h-4 w-4" strokeWidth={2} />
      </NavArrow>
    </nav>
  )
}

function PageBtn({
  children,
  onClick,
  active,
  ariaLabel,
}: {
  children: React.ReactNode
  onClick: () => void
  active?: boolean
  ariaLabel: string
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={ariaLabel}
      aria-current={active ? "page" : undefined}
      className={cn(
        "flex h-9 min-w-[36px] items-center justify-center rounded-lg px-2.5 text-sm font-medium transition-all duration-150",
        active
          ? "bg-accent-violet text-white shadow-sm"
          : "text-muted-foreground hover:bg-muted hover:text-foreground",
      )}
    >
      {children}
    </button>
  )
}

function NavArrow({
  children,
  onClick,
  disabled,
  ariaLabel,
}: {
  children: React.ReactNode
  onClick: () => void
  disabled?: boolean
  ariaLabel: string
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      aria-label={ariaLabel}
      className={cn(
        "border-border flex h-9 w-9 items-center justify-center rounded-lg border text-sm transition-colors",
        disabled
          ? "cursor-not-allowed opacity-30"
          : "text-foreground hover:bg-muted",
      )}
    >
      {children}
    </button>
  )
}
