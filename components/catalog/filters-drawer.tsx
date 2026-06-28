"use client"

import { useEffect } from "react"
import { X } from "lucide-react"
import { cn } from "@/lib/utils"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { useMediaQuery } from "@/hooks/use-media-query"

interface FiltersDrawerProps {
  open: boolean
  onClose: () => void
  resultCount: number
  children: React.ReactNode
}

const ApplyButton = ({
  resultCount,
  onClose,
}: {
  resultCount: number
  onClose: () => void
}) => (
  <button
    type="button"
    onClick={onClose}
    className="bg-foreground text-background h-12 w-full rounded-md text-sm font-semibold transition-opacity hover:opacity-90"
  >
    Show {resultCount} result{resultCount === 1 ? "" : "s"}
  </button>
)

export function FiltersDrawer({
  open,
  onClose,
  resultCount,
  children,
}: FiltersDrawerProps) {
  const isDesktop = useMediaQuery("(min-width: 1024px)")

  // Lock body scroll + close on Escape while mobile sheet is open.
  useEffect(() => {
    if (!open || isDesktop) return
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
  }, [open, onClose, isDesktop])

  if (isDesktop) {
    return (
      <Dialog open={open} onOpenChange={(o) => !o && onClose()}>
        <DialogContent className="flex max-h-[80dvh] max-w-sm flex-col gap-0 p-0">
          <DialogHeader className="border-border shrink-0 border-b px-5 pt-5 pb-4">
            <DialogTitle>Filters</DialogTitle>
          </DialogHeader>
          <div className="flex-1 overflow-y-auto px-5 py-6">{children}</div>
          <div className="border-border shrink-0 border-t px-5 py-4">
            <ApplyButton resultCount={resultCount} onClose={onClose} />
          </div>
        </DialogContent>
      </Dialog>
    )
  }

  return (
    <div
      className={cn(
        "fixed inset-0 z-50",
        open ? "pointer-events-auto" : "pointer-events-none",
      )}
      aria-hidden={!open}
    >
      <button
        type="button"
        aria-label="Close filters"
        onClick={onClose}
        className={cn(
          "bg-foreground/40 absolute inset-0 transition-opacity duration-300",
          open ? "opacity-100" : "opacity-0",
        )}
      />

      <div
        role="dialog"
        aria-modal="true"
        aria-label="Filters"
        className={cn(
          "border-border bg-background absolute inset-x-0 bottom-0 flex max-h-[88dvh] flex-col rounded-t-2xl border-t shadow-2xl transition-transform duration-300 ease-out",
          open ? "translate-y-0" : "translate-y-full",
        )}
      >
        <div className="border-border shrink-0 border-b px-5 pt-3 pb-4">
          <div className="bg-border mx-auto mb-3 h-1 w-10 rounded-full" />
          <div className="flex items-center justify-end">
            <button
              type="button"
              onClick={onClose}
              aria-label="Close filters"
              className="text-muted-foreground hover:bg-muted hover:text-foreground flex h-8 w-8 items-center justify-center rounded-md transition-colors"
            >
              <X className="h-5 w-5" strokeWidth={1.75} />
            </button>
          </div>
        </div>
        <div className="flex-1 overflow-y-auto px-5 py-6">{children}</div>
        <div className="border-border bg-background shrink-0 border-t px-5 py-4">
          <ApplyButton resultCount={resultCount} onClose={onClose} />
        </div>
      </div>
    </div>
  )
}
