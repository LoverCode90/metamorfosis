"use client"

import { useEffect } from "react"
import { ShieldCheck, X, Lock } from "lucide-react"
import { useRouter } from "next/navigation"
import { useCart } from "@/hooks/use-cart"
import { PRO_RESTRICTIONS_ENABLED } from "@/lib/constants"

export function VerifyGateModal({
  open,
  onClose,
}: {
  open: boolean
  onClose: () => void
}) {
  const router = useRouter()
  const { items } = useCart()

  useEffect(() => {
    if (!open || !PRO_RESTRICTIONS_ENABLED) return
    const previous = document.body.style.overflow
    document.body.style.overflow = "hidden"
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose()
    }
    window.addEventListener("keydown", onKey)
    return () => {
      document.body.style.overflow = previous
      window.removeEventListener("keydown", onKey)
    }
  }, [open, onClose])

  if (!open || !PRO_RESTRICTIONS_ENABLED) return null

  const proItems = items.filter((item) => item.isProfessional)

  return (
    <div
      className="fixed inset-0 z-[60] flex items-center justify-center p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="verify-gate-title"
    >
      <button
        type="button"
        aria-label="Close"
        onClick={onClose}
        className="bg-foreground/40 absolute inset-0 backdrop-blur-sm"
      />

      <div className="border-border bg-background relative w-full max-w-md rounded-xl border p-6 shadow-2xl">
        <button
          type="button"
          onClick={onClose}
          aria-label="Close dialog"
          className="text-muted-foreground hover:bg-muted hover:text-foreground absolute top-4 right-4 flex h-8 w-8 items-center justify-center rounded-md transition-colors"
        >
          <X className="h-5 w-5" strokeWidth={1.75} />
        </button>

        <div className="bg-muted flex h-12 w-12 items-center justify-center rounded-full">
          <Lock className="text-foreground h-6 w-6" strokeWidth={1.75} />
        </div>

        <h2
          id="verify-gate-title"
          className="text-foreground mt-4 text-lg font-semibold text-balance"
        >
          Professional verification required
        </h2>
        <p className="text-muted-foreground mt-2 text-sm leading-relaxed">
          Your bag contains professional-only products that require a valid
          cosmetology or salon license. Verify your credentials to continue to
          checkout.
        </p>

        <ul className="border-border bg-muted/40 mt-4 space-y-2 rounded-lg border p-3">
          {proItems.map((item) => (
            <li
              key={item.id}
              className="text-foreground flex items-center gap-2 text-sm"
            >
              <ShieldCheck
                className="text-muted-foreground h-4 w-4 shrink-0"
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
              router.push("/verify")
            }}
            className="bg-foreground text-background focus-visible:ring-ring inline-flex h-10 flex-1 items-center justify-center gap-2 rounded-md px-4 text-sm font-semibold transition-opacity hover:opacity-90 focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-none"
          >
            <ShieldCheck className="h-4 w-4" strokeWidth={2} />
            Verify my license
          </button>
          <button
            type="button"
            onClick={onClose}
            className="border-border bg-background text-foreground hover:bg-muted focus-visible:ring-ring inline-flex h-10 flex-1 items-center justify-center rounded-md border px-4 text-sm font-medium transition-colors focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-none"
          >
            Back to bag
          </button>
        </div>
      </div>
    </div>
  )
}
