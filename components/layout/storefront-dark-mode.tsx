"use client"

import { useEffect } from "react"

/**
 * Keeps `dark` on the document root while a storefront layout is mounted.
 * Admin theme prefs must not toggle this class — storefront always renders dark.
 */
export function StorefrontDarkMode() {
  useEffect(() => {
    document.documentElement.classList.add("dark")
    document.documentElement.dataset.storefront = "true"

    return () => {
      document.documentElement.classList.remove("dark")
      delete document.documentElement.dataset.storefront
    }
  }, [])

  return null
}
