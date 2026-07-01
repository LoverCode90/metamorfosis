"use client"

import { useEffect } from "react"
import { usePathname, useRouter } from "next/navigation"

import { createClient } from "@/lib/supabase/client"

const AUTH_PATH_PREFIXES = ["/login", "/signup", "/auth/"]

function isAuthPath(pathname: string): boolean {
  return AUTH_PATH_PREFIXES.some(
    (prefix) => pathname === prefix || pathname.startsWith(prefix),
  )
}

/**
 * Keeps authenticated shoppers from swiping back into OAuth / sign-in screens.
 */
export function OAuthHistoryGuard() {
  const router = useRouter()
  const pathname = usePathname()

  useEffect(() => {
    const supabase = createClient()

    async function init() {
      const {
        data: { user },
      } = await supabase.auth.getUser()
      if (!user) return

      if (sessionStorage.getItem("oauth_history_cleared") === "1") {
        sessionStorage.removeItem("oauth_history_cleared")
        window.history.replaceState(
          { appEntry: true },
          "",
          window.location.href,
        )
      }
    }

    void init()

    const onPopState = () => {
      void (async () => {
        const {
          data: { user },
        } = await supabase.auth.getUser()
        if (!user) return

        const currentPath = window.location.pathname
        if (!isAuthPath(currentPath)) return

        const fallback =
          pathname && !isAuthPath(pathname) ? pathname : "/profile"

        window.history.pushState({ appEntry: true }, "", fallback)
        router.replace(fallback)
      })()
    }

    window.addEventListener("popstate", onPopState)
    return () => window.removeEventListener("popstate", onPopState)
  }, [pathname, router])

  return null
}
