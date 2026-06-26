"use client"

import { useEffect, useState } from "react"

/**
 * Returns false on the server / first client render and true after mount.
 * Use to defer rendering of client-only values and avoid hydration mismatches.
 */
export function useMounted(): boolean {
  const [mounted, setMounted] = useState(false)
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setMounted(true)
  }, [])
  return mounted
}
