"use client"

import { useEffect } from "react"
import { ShieldCheck, X, Lock } from "lucide-react"
import { useCart } from "../cart-context"

/**
 * Blocking modal shown when a user tries to check out with professional-only
 * items in the cart but has not yet completed license verification.
 */
export function VerifyGateModal({
  open,
  onClose,
}: {
  open: boolean
  onClose: () => void
}) {
  const { setView, items } = useCart()

  // Lock body scroll and support Escape-to-close while the modal is open.
  useEffect(() => {
    if (!open) return
    const previous = document.body.style.overflow
    document.body.style.overflow = "hidden"
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose()
    }
    window.addEventListener("keydown", onKey)
    return () => {
      document.body.style.overflow = previous
      window.removeEventListener("keydown", onKey)
    }
  }, [open, onClose])

  if (!open) return null

  const proItems = items.filter((i) => i.isProfessional)

  return (
    <div
      className="fixed inset-0 z-[60] flex items-center justify-center p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="verify-gate-title"
    >
      {/* Backdrop */}
      <button
        type="button"
        aria-label="Close"
        onClick={onClose}
        className="absolute inset-0 bg-foreground/40 backdrop-blur-sm"
      />

      {/* Panel */}
      <div className="relative w-full max-w-md rounded-xl border border-border bg-background p-6 shadow-2xl">
        <button
          type="button"
          onClick={onClose}
          aria-label="Close dialog"
          className="absolute right-4 top-4 flex h-8 w-8 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
        >
          <X className="h-5 w-5" strokeWidth={1.75} />
        </button>

        <div className="flex h-12 w-12 items-center justify-center rounded-full bg-muted">
          <Lock className="h-6 w-6 text-foreground" strokeWidth={1.75} />
        </div>

        <h2
          id="verify-gate-title"
          className="mt-4 text-lg font-semibold text-foreground text-balance"
        >
          Professional verification required
        </h2>
        <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
          Your bag contains professional-only products that require a valid
          cosmetology or salon license. Verify your credentials to continue to
          checkout.
        </p>

        {/* Affected items */}
        <ul className="mt-4 space-y-2 rounded-lg border border-border bg-muted/40 p-3">
          {proItems.map((item) => (
            <li
              key={item.id}
              className="flex items-center gap-2 text-sm text-foreground"
            >
              <ShieldCheck
                className="h-4 w-4 shrink-0 text-muted-foreground"
                strokeWidth={1.75}
              />
              <span className="truncate">{item.name}</span>
            </li>
          ))}
        </ul>

        <div className="mt-6 flex flex-col gap-2 sm:flex-row-reverse">
          <button
            type="button"
            onClick={() => {
              onClose()
              setView("verify")
            }}
            className="inline-flex h-10 flex-1 items-center justify-center gap-2 rounded-md bg-foreground px-4 text-sm font-semibold text-background transition-opacity hover:opacity-90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
          >
            <ShieldCheck className="h-4 w-4" strokeWidth={2} />
            Verify my license
          </button>
          <button
            type="button"
            onClick={onClose}
            className="inline-flex h-10 flex-1 items-center justify-center rounded-md border border-border bg-background px-4 text-sm font-medium text-foreground transition-colors hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
          >
            Back to bag
          </button>
        </div>
      </div>
    </div>
  )
}
