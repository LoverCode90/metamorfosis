"use client"

import { useState } from "react"
import { Loader2 } from "lucide-react"
import { createClient } from "@/lib/supabase/client"

type Provider = "google" | "apple"

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

function AppleIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      className="h-5 w-5"
      fill="currentColor"
      aria-hidden
    >
      <path d="M17.05 12.54c-.03-2.87 2.35-4.25 2.45-4.31-1.34-1.96-3.41-2.22-4.14-2.25-1.76-.18-3.44 1.04-4.33 1.04-.9 0-2.29-1.02-3.77-.99-1.93.03-3.72 1.12-4.72 2.84-2.02 3.5-.52 8.69 1.45 11.53 1 1.41 2.16 3 3.68 2.95 1.49-.06 2.05-.96 3.85-.96s2.31.96 3.88.93c1.6-.03 2.6-1.44 3.57-2.86.73-1.03 1.28-2.17 1.6-3.38-3.46-1.32-3.49-5.54-3.52-5.54Z" />
      <path d="M14.2 4.13c.8-.99 1.35-2.35 1.2-3.72-1.16.05-2.59.78-3.42 1.75-.73.83-1.38 2.19-1.21 3.47 1.3.1 2.62-.67 3.43-1.5Z" />
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

      <button
        type="button"
        onClick={() => signInWith("apple")}
        disabled={loading !== null}
        className="border-border bg-background text-foreground hover:bg-muted flex h-11 w-full items-center justify-center gap-3 rounded-md border text-sm font-medium transition-colors disabled:cursor-not-allowed disabled:opacity-50"
      >
        {loading === "apple" ? (
          <Loader2 className="h-4 w-4 animate-spin" />
        ) : (
          <AppleIcon />
        )}
        {label} Apple
      </button>
    </div>
  )
}
