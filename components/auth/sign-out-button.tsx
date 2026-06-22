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
}: {
  className?: string
  label?: string
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
        className={cn(
          "border-border text-destructive hover:bg-destructive/10 flex h-9 items-center gap-1.5 rounded-md border px-4 text-sm font-medium transition-colors",
          className,
        )}
      >
        <LogOut className="h-4 w-4" strokeWidth={1.75} />
        {label}
      </button>

      <Dialog open={open} onOpenChange={(o) => !pending && setOpen(o)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Are you sure you want to sign out?</DialogTitle>
            <DialogDescription>
              You&apos;ll need to sign back in to access your profile, orders,
              and saved items.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
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
