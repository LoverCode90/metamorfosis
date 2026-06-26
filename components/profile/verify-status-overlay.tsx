"use client"

import type { ReactNode } from "react"
import { AlertCircle, Check, Loader2, RefreshCw } from "lucide-react"

import { Button } from "@/components/ui/button"
import type { VerifyPhase } from "@/hooks/use-verify-wizard"
import { cn } from "@/lib/utils"

/** Circular status icon badge, optionally animated on entry. */
function StatusIcon({
  className,
  animate,
  children,
}: {
  className: string
  animate?: boolean
  children: ReactNode
}) {
  return (
    <span
      className={cn(
        "flex h-14 w-14 items-center justify-center rounded-full text-white",
        animate && "animate-in zoom-in-50 duration-300",
        className,
      )}
    >
      {children}
    </span>
  )
}

/** Overlay heading. */
function OverlayTitle({ children }: { children: ReactNode }) {
  return (
    <h2 className="text-foreground mt-6 text-lg font-semibold tracking-tight">
      {children}
    </h2>
  )
}

/** Overlay supporting copy. */
function OverlayText({ children }: { children: ReactNode }) {
  return (
    <p className="text-muted-foreground mt-2 text-sm leading-relaxed">
      {children}
    </p>
  )
}

interface VerifyStatusOverlayProps {
  phase: VerifyPhase
  rejectionReason: string
  onRetry: () => void
}

/** Full-screen overlay reflecting the verification submission lifecycle. */
export function VerifyStatusOverlay({
  phase,
  rejectionReason,
  onRetry,
}: VerifyStatusOverlayProps) {
  if (phase === "idle") return null

  return (
    <div
      className="bg-background/80 fixed inset-0 z-[70] flex items-center justify-center p-4 backdrop-blur-sm"
      role="status"
      aria-live="polite"
    >
      <div className="border-border bg-background flex w-full max-w-sm flex-col items-center rounded-2xl border p-10 text-center shadow-2xl">
        {phase === "processing" && (
          <>
            <Loader2
              className="text-foreground h-12 w-12 animate-spin"
              strokeWidth={1.5}
            />
            <OverlayTitle>Analyzing your document</OverlayTitle>
            <OverlayText>
              Cross-checking your license with the cosmetology board.
            </OverlayText>
          </>
        )}

        {phase === "success" && (
          <>
            <StatusIcon className="bg-emerald-600" animate>
              <Check className="h-7 w-7" strokeWidth={2.5} />
            </StatusIcon>
            <OverlayTitle>License verified</OverlayTitle>
            <OverlayText>
              Professional pricing is unlocked. Redirecting…
            </OverlayText>
          </>
        )}

        {phase === "pending" && (
          <>
            <StatusIcon className="bg-amber-500" animate>
              <Loader2 className="h-7 w-7" strokeWidth={2} />
            </StatusIcon>
            <OverlayTitle>Under review</OverlayTitle>
            <OverlayText>
              We&apos;ll email you within 1 business day. Redirecting to your
              profile…
            </OverlayText>
          </>
        )}

        {phase === "rejected" && (
          <>
            <StatusIcon className="bg-rose-600">
              <AlertCircle className="h-7 w-7" strokeWidth={2} />
            </StatusIcon>
            <OverlayTitle>Verification unsuccessful</OverlayTitle>
            <OverlayText>{rejectionReason}</OverlayText>
            <Button className="mt-6" onClick={onRetry}>
              <RefreshCw className="h-4 w-4" strokeWidth={2} />
              Re-upload document
            </Button>
          </>
        )}
      </div>
    </div>
  )
}
