"use client"

import { Loader2, RefreshCw, CheckCircle2, AlertCircle } from "lucide-react"

import { ADMIN_PRIMARY_BUTTON_CLASS } from "@/lib/admin/card-styles"
import { Button } from "@/components/ui/button"
import { useSyncCatalog } from "@/hooks/use-sync-catalog"
import { cn } from "@/lib/utils"

/** Pulls the latest products and prices from Square into the website. */
export function SyncCatalogButton() {
  const { isSyncing, syncError, syncResult, handleSyncCatalog } =
    useSyncCatalog()

  return (
    <div className="flex flex-col gap-4">
      <p className="text-muted-foreground text-sm leading-relaxed">
        Use this if products or prices changed in Square and you want the
        website to match. This usually runs automatically — only tap when
        something looks out of date.
      </p>

      <Button
        variant="default"
        size="lg"
        onClick={handleSyncCatalog}
        disabled={isSyncing}
        className={cn(
          "h-auto min-h-11 w-full py-3 text-base sm:w-auto",
          ADMIN_PRIMARY_BUTTON_CLASS,
        )}
      >
        {isSyncing ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Updating products…
          </>
        ) : (
          <>
            <RefreshCw className="mr-2 h-4 w-4" />
            Update products from Square
          </>
        )}
      </Button>

      {syncResult && (
        <div className="flex items-center gap-2 rounded-lg border border-emerald-500/20 bg-emerald-500/10 p-3 text-emerald-600 dark:text-emerald-400">
          <CheckCircle2 className="h-5 w-5 shrink-0" />
          <p className="text-sm font-medium">{syncResult}</p>
        </div>
      )}

      {syncError && (
        <div className="border-destructive/20 bg-destructive/10 text-destructive flex items-center gap-2 rounded-lg border p-3">
          <AlertCircle className="h-5 w-5 shrink-0" />
          <p className="text-sm font-medium">{syncError}</p>
        </div>
      )}
    </div>
  )
}
