"use client"

import { useEffect } from "react"

/**
 * Triggers the browser's print dialog immediately when the component mounts.
 * Useful for automated packing slip printing.
 */
export function PrintTrigger() {
  useEffect(() => {
    // Slight delay ensures styles are fully applied before the print dialog freezes the thread
    const timer = setTimeout(() => {
      window.print()
    }, 500)
    return () => clearTimeout(timer)
  }, [])

  return null
}
