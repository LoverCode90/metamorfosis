"use client"

import { useEffect } from "react"
import { X } from "lucide-react"
import { cn } from "@/lib/utils"

interface FiltersDrawerProps {
  open: boolean
  onClose: () => void
  resultCount: number
  children: React.ReactNode
}

export function FiltersDrawer({
  open,
  onClose,
  resultCount,
  children,
}: FiltersDrawerProps) {
  // Lock body scroll + close on Escape while open.
  useEffect(() => {
    if (!open) return
    const prev = document.body.style.overflow
    document.body.style.overflow = "hidden"
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose()
    }
    window.addEventListener("keydown", onKey)
    return () => {
      document.body.style.overflow = prev
      window.removeEventListener("keydown", onKey)
    }
  }, [open, onClose])

  return (
    <div
      className={cn(
        "fixed inset-0 z-50 lg:hidden",
        open ? "pointer-events-auto" : "pointer-events-none",
      )}
      aria-hidden={!open}
    >
      {/* Backdrop */}
      <button
        type="button"
        aria-label="Close filters"
        onClick={onClose}
        className={cn(
          "absolute inset-0 bg-foreground/40 transition-opacity duration-300",
          open ? "opacity-100" : "opacity-0",
        )}
      />

      {/* Slide-up sheet */}
      <div
        role="dialog"
        aria-modal="true"
        aria-label="Filters"
        className={cn(
          "absolute inset-x-0 bottom-0 flex max-h-[88dvh] flex-col rounded-t-2xl border-t border-border bg-background shadow-2xl transition-transform duration-300 ease-out",
          open ? "translate-y-0" : "translate-y-full",
        )}
      >
        {/* Grabber + header */}
        <div className="shrink-0 border-b border-border px-5 pb-4 pt-3">
          <div className="mx-auto mb-3 h-1 w-10 rounded-full bg-border" />
          <div className="flex items-center justify-end">
            <button
              type="button"
              onClick={onClose}
              aria-label="Close filters"
              className="flex h-8 w-8 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
            >
              <X className="h-5 w-5" strokeWidth={1.75} />
            </button>
          </div>
        </div>

        {/* Scrollable body */}
        <div className="flex-1 overflow-y-auto px-5 py-6">{children}</div>

        {/* Sticky apply footer */}
        <div className="shrink-0 border-t border-border bg-background px-5 py-4">
          <button
            type="button"
            onClick={onClose}
            className="h-12 w-full rounded-md bg-foreground text-sm font-semibold text-background transition-opacity hover:opacity-90"
          >
            Show {resultCount} result{resultCount === 1 ? "" : "s"}
          </button>
        </div>
      </div>
    </div>
  )
}
