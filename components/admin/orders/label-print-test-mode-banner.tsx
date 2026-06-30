import { AlertTriangle } from "lucide-react"

/** Warning banner when Shippo is running in test mode. */
export function LabelPrintTestModeBanner() {
  return (
    <div className="flex gap-2 rounded-lg border border-amber-500/40 bg-amber-500/10 p-3 text-sm text-amber-800 dark:text-amber-200">
      <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" />
      <p>
        Shippo test mode — this label is marked SAMPLE and cannot be mailed.
        Replace <code className="text-xs">SHIPPO_API_KEY</code> in Vercel with a
        live key from the business Shippo account.
      </p>
    </div>
  )
}
