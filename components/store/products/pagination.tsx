"use client"

import { ChevronLeft, ChevronRight } from "lucide-react"
import { cn } from "@/lib/utils"

interface PaginationProps {
  page: number
  pageCount: number
  onChange: (page: number) => void
}

/** Builds a compact page list: 1 … (p-1) p (p+1) … last */
function buildPages(page: number, pageCount: number): (number | "...")[] {
  if (pageCount <= 7) {
    return Array.from({ length: pageCount }, (_, i) => i + 1)
  }
  const pages: (number | "...")[] = [1]
  const start = Math.max(2, page - 1)
  const end = Math.min(pageCount - 1, page + 1)
  if (start > 2) pages.push("...")
  for (let i = start; i <= end; i++) pages.push(i)
  if (end < pageCount - 1) pages.push("...")
  pages.push(pageCount)
  return pages
}

export function Pagination({ page, pageCount, onChange }: PaginationProps) {
  if (pageCount <= 1) return null
  const pages = buildPages(page, pageCount)

  return (
    <nav
      className="flex items-center justify-center gap-1.5"
      aria-label="Pagination"
    >
      <PageButton
        onClick={() => onChange(page - 1)}
        disabled={page === 1}
        ariaLabel="Previous page"
      >
        <ChevronLeft className="h-4 w-4" strokeWidth={2} />
      </PageButton>

      {pages.map((p, i) =>
        p === "..." ? (
          <span
            key={`gap-${i}`}
            className="flex h-9 w-9 items-center justify-center text-sm text-muted-foreground"
          >
            …
          </span>
        ) : (
          <PageButton
            key={p}
            onClick={() => onChange(p)}
            active={p === page}
            ariaLabel={`Page ${p}`}
            current={p === page}
          >
            {p}
          </PageButton>
        ),
      )}

      <PageButton
        onClick={() => onChange(page + 1)}
        disabled={page === pageCount}
        ariaLabel="Next page"
      >
        <ChevronRight className="h-4 w-4" strokeWidth={2} />
      </PageButton>
    </nav>
  )
}

function PageButton({
  children,
  onClick,
  active,
  disabled,
  ariaLabel,
  current,
}: {
  children: React.ReactNode
  onClick: () => void
  active?: boolean
  disabled?: boolean
  ariaLabel: string
  current?: boolean
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      aria-label={ariaLabel}
      aria-current={current ? "page" : undefined}
      className={cn(
        "flex h-9 min-w-9 items-center justify-center rounded-md px-2 text-sm font-medium transition-colors",
        active
          ? "bg-foreground text-background"
          : "border border-border text-foreground hover:bg-muted",
        disabled && "cursor-not-allowed opacity-40 hover:bg-transparent",
      )}
    >
      {children}
    </button>
  )
}
