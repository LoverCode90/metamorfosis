"use client"

import {
  BadgeCheck,
  Clock,
  ExternalLink,
  RefreshCw,
  ShieldCheck,
  XCircle,
} from "lucide-react"
import Link from "next/link"
import type { VerificationStatus } from "@/lib/types"
import { PRO_RESTRICTIONS_ENABLED } from "@/lib/constants"

interface VerificationPanelProps {
  status: VerificationStatus
  rejectionReason?: string | null
}

export function VerificationPanel({
  status,
  rejectionReason,
}: VerificationPanelProps) {
  if (!PRO_RESTRICTIONS_ENABLED) return null

  return (
    <section className="border-border bg-card rounded-2xl border p-6">
      <div className="flex items-center gap-2">
        <ShieldCheck className="text-foreground h-4 w-4" strokeWidth={2} />
        <h3 className="text-foreground text-sm font-semibold">
          Professional Verification
        </h3>
      </div>

      {status === "verified" ? (
        <div className="border-accent-emerald/20 bg-accent-emerald/10 mt-4 flex items-center gap-3 rounded-xl border px-4 py-3">
          <BadgeCheck
            className="text-accent-emerald h-5 w-5 shrink-0"
            strokeWidth={2}
          />
          <p className="text-accent-emerald text-sm">
            Your license is verified. Professional pricing and B2B ordering are
            unlocked.
          </p>
        </div>
      ) : status === "pending" ? (
        <div className="border-border bg-muted mt-4 flex items-start gap-3 rounded-xl border px-4 py-3">
          <Clock
            className="text-foreground mt-0.5 h-5 w-5 shrink-0"
            strokeWidth={2}
          />
          <div>
            <p className="text-foreground text-sm font-medium">
              Review in progress
            </p>
            <p className="text-muted-foreground mt-0.5 text-sm">
              We&apos;re reviewing your documents. We&apos;ll email you as soon
              as your professional status is approved.
            </p>
          </div>
        </div>
      ) : status === "rejected" ? (
        <div className="mt-4 space-y-3">
          <div className="flex items-start gap-3 rounded-xl border border-rose-500/20 bg-rose-500/5 px-4 py-3">
            <XCircle
              className="mt-0.5 h-5 w-5 shrink-0 text-rose-400"
              strokeWidth={2}
            />
            <div>
              <p className="text-sm font-medium text-rose-400">
                Verification unsuccessful
              </p>
              {rejectionReason && (
                <p className="text-muted-foreground mt-0.5 text-sm leading-relaxed">
                  {rejectionReason}
                </p>
              )}
            </div>
          </div>
          <Link
            href="/verify"
            className="inline-flex h-10 items-center gap-2 rounded-md border border-rose-500/30 px-4 text-sm font-medium text-rose-400 transition-colors hover:border-rose-500/50 hover:bg-rose-500/5"
          >
            <RefreshCw className="h-3.5 w-3.5" strokeWidth={2} />
            Re-upload document
          </Link>
        </div>
      ) : (
        <>
          <p className="text-muted-foreground mt-3 text-sm">
            Verify your cosmetology or salon license to unlock professional
            pricing and restricted products.
          </p>
          <Link
            href="/verify"
            className="bg-accent-violet focus-visible:ring-ring mt-4 inline-flex h-10 items-center gap-2 rounded-md px-4 text-sm font-semibold text-white transition-opacity hover:opacity-90 focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-none"
          >
            Verify my license
            <ExternalLink className="h-3.5 w-3.5" strokeWidth={2} />
          </Link>
        </>
      )}
    </section>
  )
}
