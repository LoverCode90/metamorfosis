"use client"

import { useEffect } from "react"

/**
 * Locks `document.body` scrolling while `locked` is true (e.g. an open
 * drawer/modal) and restores it on unlock or unmount.
 */
export function useBodyScrollLock(locked: boolean): void {
  useEffect(() => {
    document.body.style.overflow = locked ? "hidden" : ""
    return () => {
      document.body.style.overflow = ""
    }
  }, [locked])
}
