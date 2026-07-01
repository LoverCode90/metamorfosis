"use client"

import { useEffect, useState } from "react"
import { Check, Copy } from "lucide-react"

import { cn } from "@/lib/utils"

interface CopyTrackingButtonProps {
  trackingNumber: string
  className?: string
}

export function CopyTrackingButton({
  trackingNumber,
  className,
}: CopyTrackingButtonProps) {
  const [copied, setCopied] = useState(false)

  useEffect(() => {
    if (!copied) return
    const timer = setTimeout(() => setCopied(false), 1800)
    return () => clearTimeout(timer)
  }, [copied])

  async function handleCopy() {
    try {
      await navigator.clipboard.writeText(trackingNumber)
      setCopied(true)
    } catch {
      // Clipboard unavailable — fail silently.
    }
  }

  return (
    <button
      type="button"
      onClick={handleCopy}
      aria-label="Copy tracking number"
      className={cn(
        "text-muted-foreground hover:text-foreground inline-flex size-6 shrink-0 items-center justify-center rounded transition-colors",
        copied && "text-emerald-600",
        className,
      )}
    >
      {copied ? (
        <Check className="size-3.5" strokeWidth={2.25} />
      ) : (
        <Copy className="size-3.5" strokeWidth={1.75} />
      )}
    </button>
  )
}
