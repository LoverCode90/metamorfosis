"use client"

import { useState } from "react"
import { Eye, EyeOff, Loader2 } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { AuthField } from "@/components/auth/auth-field"
import { ForgotPasswordForm } from "@/components/auth/forgot-password-form"
import { useSignIn } from "@/hooks/use-sign-in"

/** Email/password sign-in form with an inline forgot-password flow. */
export function SignInForm() {
  const [mode, setMode] = useState<"signin" | "forgot">("signin")
  const s = useSignIn()

  if (mode === "forgot") {
    return <ForgotPasswordForm onBack={() => setMode("signin")} />
  }

  return (
    <form onSubmit={s.submit} noValidate className="flex flex-col gap-4">
      <AuthField label="Email address" error={s.errors.email?.message}>
        <Input
          type="email"
          autoComplete="email"
          placeholder="you@example.com"
          {...s.register("email")}
          className="h-11"
        />
      </AuthField>

      <div className="flex flex-col gap-1.5">
        <div className="flex items-center justify-between">
          <Label className="text-foreground text-sm font-medium">
            Password
          </Label>
          <Button
            type="button"
            variant="link"
            size="sm"
            onClick={() => setMode("forgot")}
            className="text-muted-foreground h-auto p-0 text-xs"
          >
            Forgot your password?
          </Button>
        </div>
        <div className="relative">
          <Input
            type={s.showPassword ? "text" : "password"}
            autoComplete="current-password"
            placeholder="••••••••"
            {...s.register("password")}
            className="h-11 pr-10"
          />
          <Button
            type="button"
            variant="ghost"
            size="icon-sm"
            onClick={s.togglePassword}
            aria-label={s.showPassword ? "Hide password" : "Show password"}
            className="text-muted-foreground absolute top-1/2 right-1.5 -translate-y-1/2"
          >
            {s.showPassword ? (
              <EyeOff className="h-4 w-4" />
            ) : (
              <Eye className="h-4 w-4" />
            )}
          </Button>
        </div>
        {s.errors.password && (
          <p className="text-destructive text-xs">
            {s.errors.password.message}
          </p>
        )}
      </div>

      {s.serverError && (
        <p
          role="alert"
          className="bg-destructive/10 text-destructive rounded-md px-3 py-2 text-sm"
        >
          {s.serverError}
        </p>
      )}

      <Button
        type="submit"
        disabled={s.isSubmitting}
        className="mt-1 h-11 w-full"
      >
        {s.isSubmitting && <Loader2 className="h-4 w-4 animate-spin" />}
        Sign in
      </Button>
    </form>
  )
}
