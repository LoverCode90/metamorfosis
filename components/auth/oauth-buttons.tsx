"use client"

import { useState } from "react"
import { Loader2 } from "lucide-react"
import { createClient } from "@/lib/supabase/client"

type Provider = "google"

function GoogleIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-5 w-5" aria-hidden>
      <path
        fill="#4285F4"
        d="M23.52 12.27c0-.79-.07-1.54-.2-2.27H12v4.51h6.47a5.53 5.53 0 0 1-2.4 3.63v3h3.88c2.27-2.09 3.57-5.17 3.57-8.87Z"
      />
      <path
        fill="#34A853"
        d="M12 24c3.24 0 5.96-1.08 7.95-2.91l-3.88-3c-1.08.72-2.45 1.16-4.07 1.16-3.13 0-5.78-2.11-6.73-4.96H1.27v3.09A12 12 0 0 0 12 24Z"
      />
      <path
        fill="#FBBC05"
        d="M5.27 14.29A7.21 7.21 0 0 1 4.89 12c0-.8.14-1.57.38-2.29V6.62H1.27A12 12 0 0 0 0 12c0 1.94.46 3.77 1.27 5.38l4-3.09Z"
      />
      <path
        fill="#EA4335"
        d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.44-3.44C17.95 1.19 15.24 0 12 0A12 12 0 0 0 1.27 6.62l4 3.09C6.22 6.86 8.87 4.75 12 4.75Z"
      />
    </svg>
  )
}

export function OAuthButtons({
  redirectTo,
  mode = "signin",
}: {
  redirectTo?: string
  mode?: "signin" | "signup"
}) {
  const [loading, setLoading] = useState<Provider | null>(null)
  const supabase = createClient()

  const appUrl =
    typeof window !== "undefined"
      ? window.location.origin
      : (process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000")

  async function signInWith(provider: Provider) {
    setLoading(provider)
    const callbackUrl = redirectTo
      ? `${appUrl}/auth/callback?next=${encodeURIComponent(redirectTo)}`
      : `${appUrl}/auth/callback`

    const { error } = await supabase.auth.signInWithOAuth({
      provider,
      options: { redirectTo: callbackUrl },
    })
    if (error) setLoading(null)
  }

  const label = mode === "signup" ? "Sign up with" : "Sign in with"

  return (
    <div className="flex flex-col gap-3">
      <button
        type="button"
        onClick={() => signInWith("google")}
        disabled={loading !== null}
        className="border-border bg-background text-foreground hover:bg-muted flex h-11 w-full items-center justify-center gap-3 rounded-md border text-sm font-medium transition-colors disabled:cursor-not-allowed disabled:opacity-50"
      >
        {loading === "google" ? (
          <Loader2 className="h-4 w-4 animate-spin" />
        ) : (
          <GoogleIcon />
        )}
        {label} Google
      </button>
    </div>
  )
}
