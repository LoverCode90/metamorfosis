"use client"

import { useState } from "react"
import { LogOut } from "lucide-react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

/**
 * Sign-out trigger with a confirmation modal. The /api/auth/signout call only
 * fires after the user confirms; cancel dismisses without any network request.
 */
export function SignOutButton({
  className,
  label = "Sign out",
  /** When true, the text label is hidden below the `sm` breakpoint (icon only). */
  hideLabelOnMobile = false,
}: {
  className?: string
  label?: string
  hideLabelOnMobile?: boolean
}) {
  const [open, setOpen] = useState(false)
  const [pending, setPending] = useState(false)

  async function confirm() {
    setPending(true)
    try {
      await fetch("/api/auth/signout", { method: "POST" })
      window.location.href = "/"
    } catch {
      setPending(false)
    }
  }

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        aria-label={label}
        className={cn(
          "border-border text-destructive hover:bg-destructive/10 flex h-9 items-center gap-1.5 rounded-md border px-3 text-sm font-medium transition-colors sm:px-4",
          className,
        )}
      >
        <LogOut className="h-4 w-4 shrink-0" strokeWidth={1.75} />
        <span className={cn(hideLabelOnMobile && "hidden sm:inline")}>
          {label}
        </span>
      </button>

      <Dialog open={open} onOpenChange={(o) => !pending && setOpen(o)}>
        <DialogContent className="dark bg-background text-foreground">
          <DialogHeader>
            <DialogTitle>Are you sure you want to sign out?</DialogTitle>
            <DialogDescription>
              You&apos;ll need to sign back in to access your profile, orders,
              and saved items.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="border-border bg-background">
            <Button
              variant="outline"
              onClick={() => setOpen(false)}
              disabled={pending}
            >
              Cancel
            </Button>
            <Button variant="destructive" onClick={confirm} disabled={pending}>
              {pending ? "Signing out…" : "Confirm sign out"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}
