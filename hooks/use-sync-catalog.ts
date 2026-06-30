"use client"

import { useState, useCallback } from "react"

interface SyncStats {
  items?: number
  variations?: number
  deactivated?: number
}

interface SyncCatalogResult {
  isSyncing: boolean
  syncError: string | null
  syncResult: string | null
  handleSyncCatalog: () => Promise<void>
}

/**
 * Custom hook to manage the state and execution of the Square catalog synchronization.
 * Handles the POST /api/admin/sync-catalog request.
 */
export function useSyncCatalog(): SyncCatalogResult {
  const [isSyncing, setIsSyncing] = useState<boolean>(false)
  const [syncError, setSyncError] = useState<string | null>(null)
  const [syncResult, setSyncResult] = useState<string | null>(null)

  const handleSyncCatalog = useCallback(async () => {
    setIsSyncing(true)
    setSyncError(null)
    setSyncResult(null)

    try {
      const response = await fetch("/api/admin/sync-catalog", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
      })

      const responseData = await response.json()

      if (!response.ok || !responseData.ok) {
        const errorMessage =
          responseData.error || "Failed to synchronize catalog."
        setSyncError(errorMessage)
        return
      }

      const stats: SyncStats = responseData.stats || {}
      const itemsCount = stats.items ?? 0
      const variationsCount = stats.variations ?? 0
      const deactivatedCount = stats.deactivated ?? 0

      setSyncResult(
        `Catalog synchronized successfully. Updated ${itemsCount} items, ${variationsCount} variations, and deactivated ${deactivatedCount} outdated items.`,
      )
    } catch (error) {
      const unexpectedError =
        error instanceof Error ? error.message : "An unexpected error occurred."
      setSyncError(unexpectedError)
    } finally {
      setIsSyncing(false)
    }
  }, [])

  return {
    isSyncing,
    syncError,
    syncResult,
    handleSyncCatalog,
  }
}
