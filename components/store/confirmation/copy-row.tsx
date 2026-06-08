"use client"

import { useEffect, useState } from "react"
import { Check, Copy } from "lucide-react"
import { cn } from "@/lib/utils"

interface CopyRowProps {
  label: string
  value: string
}

export function CopyRow({ label, value }: CopyRowProps) {
  const [copied, setCopied] = useState(false)

  useEffect(() => {
    if (!copied) return
    const t = setTimeout(() => setCopied(false), 1800)
    return () => clearTimeout(t)
  }, [copied])

  async function handleCopy() {
    try {
      await navigator.clipboard.writeText(value)
      setCopied(true)
    } catch {
      // Clipboard unavailable — fail silently.
    }
  }

  return (
    <div className="flex items-center justify-between gap-3 rounded-lg border border-border bg-muted/30 px-3.5 py-2.5">
      <div className="min-w-0">
        <p className="text-[11px] font-medium uppercase tracking-wide text-muted-foreground">
          {label}
        </p>
        <p className="truncate font-mono text-sm font-medium text-foreground">
          {value}
        </p>
      </div>
      <button
        type="button"
        onClick={handleCopy}
        aria-label={`Copy ${label}`}
        className={cn(
          "flex h-9 w-9 shrink-0 items-center justify-center rounded-md border border-border transition-colors",
          copied
            ? "border-emerald-600/30 text-emerald-600"
            : "text-muted-foreground hover:text-foreground",
        )}
      >
        {copied ? (
          <Check className="h-4 w-4" strokeWidth={2.25} />
        ) : (
          <Copy className="h-4 w-4" strokeWidth={1.75} />
        )}
      </button>
    </div>
  )
}
