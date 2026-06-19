"use client"

import { X } from "lucide-react"
import { OAuthButtons } from "@/components/auth/oauth-buttons"
import Link from "next/link"

interface WishlistLoginModalProps {
  open: boolean
  onClose: () => void
}

/**
 * Shown when a guest clicks the heart/wishlist icon.
 * Directs them to sign in so their wishlist persists.
 */
export function WishlistLoginModal({ open, onClose }: WishlistLoginModalProps) {
  if (!open) return null

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className="bg-background border-border relative w-full max-w-sm rounded-2xl border p-8 shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          type="button"
          onClick={onClose}
          className="text-muted-foreground hover:text-foreground absolute top-4 right-4"
          aria-label="Close"
        >
          <X className="h-5 w-5" strokeWidth={1.75} />
        </button>

        <div className="text-center">
          <p className="mb-2 text-2xl">🤍</p>
          <h2 className="text-foreground text-lg font-semibold">
            Save to Wishlist
          </h2>
          <p className="text-muted-foreground mt-1.5 text-sm">
            Sign in to save items and access your wishlist from any device.
          </p>
        </div>

        <div className="mt-6 space-y-3">
          <OAuthButtons mode="signin" />
          <div className="relative flex items-center gap-2">
            <span className="border-border flex-1 border-t" />
            <span className="text-muted-foreground text-xs">or</span>
            <span className="border-border flex-1 border-t" />
          </div>
          <Link
            href="/login"
            onClick={onClose}
            className="border-border text-foreground hover:bg-muted flex h-11 w-full items-center justify-center rounded-md border text-sm font-medium transition-colors"
          >
            Sign in with email
          </Link>
        </div>
      </div>
    </div>
  )
}
