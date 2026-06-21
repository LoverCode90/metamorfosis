"use client"

import { useState } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { useRouter, useSearchParams } from "next/navigation"
import { Eye, EyeOff, Loader2 } from "lucide-react"
import { createClient } from "@/lib/supabase/client"
import { SignInSchema, type SignInInput } from "@/lib/validation/schemas"

export function SignInForm() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const nextPath = searchParams.get("next") ?? "/profile"

  const [showPassword, setShowPassword] = useState(false)
  const [serverError, setServerError] = useState<string | null>(null)

  // Forgot-password inline state
  const [mode, setMode] = useState<"signin" | "forgot">("signin")
  const [forgotEmail, setForgotEmail] = useState("")
  const [forgotSubmitting, setForgotSubmitting] = useState(false)
  const [forgotDone, setForgotDone] = useState(false)
  const [forgotError, setForgotError] = useState<string | null>(null)

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<SignInInput>({ resolver: zodResolver(SignInSchema) })

  async function onSubmit(data: SignInInput) {
    setServerError(null)
    const supabase = createClient()
    const { error } = await supabase.auth.signInWithPassword({
      email: data.email,
      password: data.password,
    })

    if (error) {
      setServerError("Incorrect email or password. Please try again.")
      return
    }

    router.push(nextPath.startsWith("/") ? nextPath : "/profile")
    router.refresh()
  }

  async function onForgotSubmit(e: React.FormEvent) {
    e.preventDefault()
    setForgotError(null)
    setForgotSubmitting(true)

    const res = await fetch("/api/auth/forgot-password", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email: forgotEmail }),
    })

    if (!res.ok) {
      const body = (await res.json().catch(() => ({}))) as { error?: string }
      setForgotError(body.error ?? "Something went wrong. Please try again.")
      setForgotSubmitting(false)
      return
    }

    setForgotDone(true)
    setForgotSubmitting(false)
  }

  // ── Forgot-password view ──────────────────────────────────────────────────
  if (mode === "forgot") {
    return (
      <div className="flex flex-col gap-4">
        <p className="text-muted-foreground text-sm">
          Enter your email and we&apos;ll send you a reset link if an account
          exists.
        </p>

        {forgotDone ? (
          <p className="border-border bg-muted/40 text-muted-foreground rounded-xl border px-5 py-4 text-sm">
            If that email has an account, you&apos;ll receive a reset link
            shortly.
          </p>
        ) : (
          <form onSubmit={onForgotSubmit} className="flex flex-col gap-4">
            <Field label="Email address">
              <input
                type="email"
                autoComplete="email"
                placeholder="you@example.com"
                value={forgotEmail}
                onChange={(e) => setForgotEmail(e.target.value)}
                required
                className="border-border bg-background text-foreground placeholder:text-muted-foreground focus:border-foreground h-11 w-full rounded-md border px-3 text-sm transition-colors outline-none"
              />
            </Field>

            {forgotError && (
              <p
                role="alert"
                className="bg-destructive/10 text-destructive rounded-md px-3 py-2 text-sm"
              >
                {forgotError}
              </p>
            )}

            <button
              type="submit"
              disabled={forgotSubmitting || !forgotEmail}
              className="bg-foreground text-background flex h-11 w-full items-center justify-center gap-2 rounded-md text-sm font-semibold transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {forgotSubmitting ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : null}
              Send reset link
            </button>
          </form>
        )}

        <button
          type="button"
          onClick={() => {
            setMode("signin")
            setForgotDone(false)
            setForgotError(null)
          }}
          className="text-muted-foreground hover:text-foreground text-center text-sm transition-colors"
        >
          ← Back to sign in
        </button>
      </div>
    )
  }

  // ── Sign-in view ──────────────────────────────────────────────────────────
  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      noValidate
      className="flex flex-col gap-4"
    >
      <Field label="Email address" error={errors.email?.message}>
        <input
          type="email"
          autoComplete="email"
          placeholder="you@example.com"
          {...register("email")}
          className="border-border bg-background text-foreground placeholder:text-muted-foreground focus:border-foreground h-11 w-full rounded-md border px-3 text-sm transition-colors outline-none"
        />
      </Field>

      <div className="flex flex-col gap-1.5">
        <div className="flex items-center justify-between">
          <label className="text-foreground text-sm font-medium">
            Password
          </label>
          <button
            type="button"
            onClick={() => setMode("forgot")}
            className="text-muted-foreground hover:text-foreground text-xs transition-colors"
          >
            Forgot your password?
          </button>
        </div>
        <div className="relative">
          <input
            type={showPassword ? "text" : "password"}
            autoComplete="current-password"
            placeholder="••••••••"
            {...register("password")}
            className="border-border bg-background text-foreground placeholder:text-muted-foreground focus:border-foreground h-11 w-full rounded-md border px-3 pr-10 text-sm transition-colors outline-none"
          />
          <button
            type="button"
            onClick={() => setShowPassword((v) => !v)}
            aria-label={showPassword ? "Hide password" : "Show password"}
            className="text-muted-foreground hover:text-foreground absolute top-1/2 right-3 -translate-y-1/2"
          >
            {showPassword ? (
              <EyeOff className="h-4 w-4" />
            ) : (
              <Eye className="h-4 w-4" />
            )}
          </button>
        </div>
        {errors.password && (
          <p className="text-destructive text-xs">{errors.password.message}</p>
        )}
      </div>

      {serverError && (
        <p
          role="alert"
          className="bg-destructive/10 text-destructive rounded-md px-3 py-2 text-sm"
        >
          {serverError}
        </p>
      )}

      <button
        type="submit"
        disabled={isSubmitting}
        className="bg-foreground text-background mt-1 flex h-11 w-full items-center justify-center gap-2 rounded-md text-sm font-semibold transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
      >
        {isSubmitting ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
        Sign in
      </button>
    </form>
  )
}

function Field({
  label,
  error,
  children,
}: {
  label: string
  error?: string
  children: React.ReactNode
}) {
  return (
    <div className="flex flex-col gap-1.5">
      <label className="text-foreground text-sm font-medium">{label}</label>
      {children}
      {error && <p className="text-destructive text-xs">{error}</p>}
    </div>
  )
}
