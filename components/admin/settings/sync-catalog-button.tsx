"use client"

import { Loader2, RefreshCw, CheckCircle2, AlertCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useSyncCatalog } from "@/hooks/use-sync-catalog"

/**
 * UI component displaying the catalog synchronization button and its execution results.
 * Fully responsive and delegates all state and business logic to useSyncCatalog.
 */
export function SyncCatalogButton() {
  const { isSyncing, syncError, syncResult, handleSyncCatalog } =
    useSyncCatalog()

  return (
    <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
      <div className="flex flex-col gap-2">
        <Button
          variant="default"
          size="default"
          onClick={handleSyncCatalog}
          disabled={isSyncing}
          className="w-full sm:w-auto"
        >
          {isSyncing ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Syncing Catalog...
            </>
          ) : (
            <>
              <RefreshCw className="mr-2 h-4 w-4" />
              Sync Catalog
            </>
          )}
        </Button>
      </div>

      {syncResult && (
        <div className="flex items-center gap-2 rounded-lg border border-emerald-500/20 bg-emerald-500/10 p-3 text-emerald-600 dark:text-emerald-400">
          <CheckCircle2 className="h-5 w-5 shrink-0" />
          <p className="text-xs font-medium sm:text-sm">{syncResult}</p>
        </div>
      )}

      {syncError && (
        <div className="border-destructive/20 bg-destructive/10 text-destructive flex items-center gap-2 rounded-lg border p-3">
          <AlertCircle className="h-5 w-5 shrink-0" />
          <p className="text-xs font-medium sm:text-sm">{syncError}</p>
        </div>
      )}
    </div>
  )
}
