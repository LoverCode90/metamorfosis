"use client"

import { useState } from "react"
import { useForm, useWatch } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { useRouter } from "next/navigation"
import { Eye, EyeOff, Loader2 } from "lucide-react"
import { SignupSchema, type SignupInput } from "@/lib/validation/schemas"
import { TurnstileWidget } from "./turnstile-widget"
import { PasswordStrength } from "@/components/ui/password-strength"

export function SignUpForm() {
  const router = useRouter()
  const [showPassword, setShowPassword] = useState(false)
  const [serverError, setServerError] = useState<string | null>(null)
  const [turnstileToken, setTurnstileToken] = useState<string | null>(null)

  const {
    register,
    handleSubmit,
    control,
    formState: { errors, isSubmitting },
  } = useForm<SignupInput>({ resolver: zodResolver(SignupSchema) })

  const passwordValue = useWatch({ control, name: "password" }) ?? ""

  async function onSubmit(data: SignupInput) {
    setServerError(null)
    const res = await fetch("/api/auth/signup", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...data, turnstileToken }),
    })

    if (!res.ok) {
      const body = (await res.json().catch(() => ({}))) as { error?: string }
      setServerError(body.error ?? "Something went wrong. Please try again.")
      return
    }

    sessionStorage.setItem("signup_email", data.email)
    sessionStorage.setItem("signup_password", data.password)

    router.push("/verify-email")
  }

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      noValidate
      className="flex flex-col gap-4"
    >
      <div className="grid grid-cols-2 gap-3">
        <Field label="First name" error={errors.firstName?.message}>
          <input
            type="text"
            autoComplete="given-name"
            placeholder="Jane"
            {...register("firstName")}
            className="border-border bg-background text-foreground placeholder:text-muted-foreground focus:border-foreground h-11 w-full rounded-md border px-3 text-sm transition-colors outline-none"
          />
        </Field>
        <Field label="Last name" error={errors.lastName?.message}>
          <input
            type="text"
            autoComplete="family-name"
            placeholder="Smith"
            {...register("lastName")}
            className="border-border bg-background text-foreground placeholder:text-muted-foreground focus:border-foreground h-11 w-full rounded-md border px-3 text-sm transition-colors outline-none"
          />
        </Field>
      </div>

      <Field label="Email address" error={errors.email?.message}>
        <input
          type="email"
          autoComplete="email"
          placeholder="you@example.com"
          {...register("email")}
          className="border-border bg-background text-foreground placeholder:text-muted-foreground focus:border-foreground h-11 w-full rounded-md border px-3 text-sm transition-colors outline-none"
        />
      </Field>

      <Field label="Password" error={errors.password?.message}>
        <div className="relative">
          <input
            type={showPassword ? "text" : "password"}
            autoComplete="new-password"
            placeholder="At least 8 chars, 1 uppercase, 1 number, 1 special"
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
        <PasswordStrength password={passwordValue} />
      </Field>

      <TurnstileWidget
        onVerify={(token) => setTurnstileToken(token)}
        onExpire={() => setTurnstileToken(null)}
      />

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
        Create account
      </button>

      <p className="text-muted-foreground text-center text-xs">
        By signing up you agree to our{" "}
        <span className="underline underline-offset-2">Terms of Service</span>{" "}
        and <span className="underline underline-offset-2">Privacy Policy</span>
        .
      </p>
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
