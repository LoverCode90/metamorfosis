"use client"

import { Suspense, useEffect } from "react"
import { useSearchParams } from "next/navigation"

function AuthCompleteRedirect() {
  const searchParams = useSearchParams()

  useEffect(() => {
    const next = searchParams.get("next")
    const destination =
      next && next.startsWith("/") && !next.startsWith("//") ? next : "/profile"

    sessionStorage.setItem("oauth_history_cleared", "1")
    window.location.replace(destination)
  }, [searchParams])

  return (
    <div className="bg-background text-muted-foreground flex min-h-dvh items-center justify-center px-6 text-center text-sm">
      Signing you in…
    </div>
  )
}

export default function AuthCompletePage() {
  return (
    <Suspense
      fallback={
        <div className="bg-background text-muted-foreground flex min-h-dvh items-center justify-center px-6 text-center text-sm">
          Signing you in…
        </div>
      }
    >
      <AuthCompleteRedirect />
    </Suspense>
  )
}
