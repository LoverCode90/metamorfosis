"use client"

import { useState, type FormEvent } from "react"
import { Eye, EyeOff, LogIn } from "lucide-react"
import { useCart } from "../cart-context"

// Minimal inline SVG brand icons (Google & Apple) — no external library needed.
function GoogleIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-5 w-5" aria-hidden="true">
      <path
        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
        fill="#4285F4"
      />
      <path
        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
        fill="#34A853"
      />
      <path
        d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z"
        fill="#FBBC05"
      />
      <path
        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
        fill="#EA4335"
      />
    </svg>
  )
}

function AppleIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-5 w-5" fill="currentColor" aria-hidden="true">
      <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.8-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M13 3.5c.73-.83 1.94-1.46 2.94-1.5.13 1.17-.34 2.35-1.04 3.19-.69.85-1.83 1.51-2.95 1.42-.15-1.15.41-2.35 1.05-3.11z" />
    </svg>
  )
}

interface AuthPageProps {
  mode: "login" | "signup"
}

export function AuthPage({ mode }: AuthPageProps) {
  const { setView } = useCart()
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [name, setName] = useState("")
  const [showPw, setShowPw] = useState(false)
  const [submitted, setSubmitted] = useState(false)

  const isLogin = mode === "login"

  function handleSubmit(e: FormEvent) {
    e.preventDefault()
    setSubmitted(true)
    // Simulate auth — route home on success.
    setTimeout(() => setView("home"), 800)
  }

  return (
    <div className="flex min-h-[calc(100dvh-4rem)] items-center justify-center bg-background px-4 py-12">
      <div className="w-full max-w-sm">
        {/* Card */}
        <div className="rounded-2xl border border-border bg-card px-8 py-10 shadow-sm">
          {/* Icon */}
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-xl border border-border bg-background shadow-sm">
            <LogIn className="h-5 w-5 text-foreground" strokeWidth={1.75} />
          </div>

          {/* Heading */}
          <div className="mt-6 text-center">
            <h1 className="text-xl font-semibold tracking-tight text-foreground">
              {isLogin ? "Sign in with email" : "Create your account"}
            </h1>
            <p className="mt-1.5 text-sm text-muted-foreground">
              {isLogin
                ? "Welcome back to Metamorfosis Lab."
                : "Join the professional network. No subscriptions."}
            </p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="mt-7 flex flex-col gap-3" noValidate>
            {!isLogin && (
              <input
                type="text"
                placeholder="Full name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                autoComplete="name"
                className="h-11 w-full rounded-lg border border-border bg-muted px-4 text-sm text-foreground placeholder:text-muted-foreground outline-none transition-colors focus:border-foreground focus:bg-background"
              />
            )}

            <input
              type="email"
              placeholder="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              autoComplete="email"
              className="h-11 w-full rounded-lg border border-border bg-muted px-4 text-sm text-foreground placeholder:text-muted-foreground outline-none transition-colors focus:border-foreground focus:bg-background"
            />

            <div className="relative">
              <input
                type={showPw ? "text" : "password"}
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                autoComplete={isLogin ? "current-password" : "new-password"}
                className="h-11 w-full rounded-lg border border-border bg-muted px-4 pr-11 text-sm text-foreground placeholder:text-muted-foreground outline-none transition-colors focus:border-foreground focus:bg-background"
              />
              <button
                type="button"
                aria-label={showPw ? "Hide password" : "Show password"}
                onClick={() => setShowPw((p) => !p)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
              >
                {showPw ? (
                  <EyeOff className="h-4 w-4" strokeWidth={1.75} />
                ) : (
                  <Eye className="h-4 w-4" strokeWidth={1.75} />
                )}
              </button>
            </div>

            {isLogin && (
              <div className="flex justify-end">
                <button
                  type="button"
                  className="text-xs text-muted-foreground hover:text-foreground"
                >
                  Forgot password?
                </button>
              </div>
            )}

            <button
              type="submit"
              disabled={submitted}
              className="mt-1 h-11 w-full rounded-lg bg-foreground text-sm font-semibold text-background transition-opacity hover:opacity-90 disabled:opacity-60"
            >
              {submitted ? "Please wait…" : isLogin ? "Get Started" : "Create Account"}
            </button>
          </form>

          {/* Divider */}
          <div className="relative my-6 flex items-center">
            <span className="flex-1 border-t border-border" />
            <span className="mx-4 text-xs text-muted-foreground">Or sign in with</span>
            <span className="flex-1 border-t border-border" />
          </div>

          {/* OAuth — Google + Apple only (no Facebook per spec) */}
          <div className="grid grid-cols-2 gap-3">
            <button
              type="button"
              className="flex h-11 items-center justify-center gap-2.5 rounded-lg border border-border bg-background text-sm font-medium text-foreground transition-colors hover:bg-muted"
            >
              <GoogleIcon />
              <span className="sr-only sm:not-sr-only">Google</span>
            </button>
            <button
              type="button"
              className="flex h-11 items-center justify-center gap-2.5 rounded-lg border border-border bg-background text-sm font-medium text-foreground transition-colors hover:bg-muted"
            >
              <AppleIcon />
              <span className="sr-only sm:not-sr-only">Apple</span>
            </button>
          </div>
        </div>

        {/* Switch mode */}
        <p className="mt-6 text-center text-sm text-muted-foreground">
          {isLogin ? "Don't have an account?" : "Already have an account?"}{" "}
          <button
            type="button"
            onClick={() => setView(isLogin ? "signup" : "login")}
            className="font-semibold text-foreground underline underline-offset-2"
          >
            {isLogin ? "Sign up" : "Sign in"}
          </button>
        </p>
      </div>
    </div>
  )
}
