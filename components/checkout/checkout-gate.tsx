"use client"

import Link from "next/link"
import { ShieldAlert, Trash2 } from "lucide-react"
import type { CartItem } from "@/lib/types"

interface CheckoutGateProps {
  proItems: CartItem[]
  isAuthenticated: boolean
  onRemovePro: () => void
}

/**
 * Inline block shown when the cart contains professional items but the user
 * is either not authenticated or not verified.
 */
export function CheckoutGate({
  proItems,
  isAuthenticated,
  onRemovePro,
}: CheckoutGateProps) {
  return (
    <div className="mx-auto max-w-lg rounded-2xl border border-amber-500/30 bg-amber-500/5 p-8 text-center">
      <ShieldAlert
        className="mx-auto mb-4 h-10 w-10 text-amber-400"
        strokeWidth={1.5}
      />
      <h2 className="text-foreground text-lg font-semibold">
        Professional Products in Your Cart
      </h2>
      <p className="text-muted-foreground mt-2 text-sm leading-relaxed">
        Your cart contains professional-only products:
      </p>
      <ul className="mt-3 space-y-1">
        {proItems.map((item) => (
          <li
            key={item.variationId ?? item.id}
            className="text-sm font-medium text-amber-400"
          >
            {item.name}
          </li>
        ))}
      </ul>

      <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:justify-center">
        {!isAuthenticated ? (
          <Link
            href="/login?redirect=/checkout"
            className="bg-foreground text-background inline-flex h-11 items-center justify-center rounded-md px-6 text-sm font-semibold transition-opacity hover:opacity-90"
          >
            Sign in to continue
          </Link>
        ) : (
          <Link
            href="/verify"
            className="bg-foreground text-background inline-flex h-11 items-center justify-center rounded-md px-6 text-sm font-semibold transition-opacity hover:opacity-90"
          >
            Verify my license
          </Link>
        )}

        <button
          type="button"
          onClick={onRemovePro}
          className="border-border text-foreground hover:bg-muted inline-flex h-11 items-center justify-center gap-2 rounded-md border px-6 text-sm font-medium transition-colors"
        >
          <Trash2 className="h-4 w-4" strokeWidth={1.75} />
          Remove professional items
        </button>
      </div>
    </div>
  )
}
