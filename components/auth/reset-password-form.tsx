"use client"

import { useState } from "react"
import { useForm, useWatch } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { useRouter } from "next/navigation"
import { Eye, EyeOff, Loader2 } from "lucide-react"
import { createClient } from "@/lib/supabase/client"
import {
  ResetPasswordSchema,
  type ResetPasswordInput,
} from "@/lib/validation/schemas"
import { PasswordStrength } from "@/components/ui/password-strength"

export function ResetPasswordForm() {
  const router = useRouter()
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirm, setShowConfirm] = useState(false)
  const [serverError, setServerError] = useState<string | null>(null)

  const {
    register,
    handleSubmit,
    control,
    formState: { errors, isSubmitting },
  } = useForm<ResetPasswordInput>({
    resolver: zodResolver(ResetPasswordSchema),
  })
  const passwordValue = useWatch({ control, name: "password" }) ?? ""

  async function onSubmit(data: ResetPasswordInput) {
    setServerError(null)
    const supabase = createClient()
    const { error } = await supabase.auth.updateUser({
      password: data.password,
    })

    if (error) {
      setServerError(
        error.message.includes("session")
          ? "Your reset link has expired. Please request a new one."
          : "Could not update your password. Please try again.",
      )
      return
    }

    router.push("/login")
  }

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      noValidate
      className="flex flex-col gap-4"
    >
      <Field label="New password" error={errors.password?.message}>
        <div className="relative">
          <input
            type={showPassword ? "text" : "password"}
            autoComplete="new-password"
            placeholder="Minimum 8 characters"
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

      <Field
        label="Confirm new password"
        error={errors.confirmPassword?.message}
      >
        <div className="relative">
          <input
            type={showConfirm ? "text" : "password"}
            autoComplete="new-password"
            placeholder="Repeat your new password"
            {...register("confirmPassword")}
            className="border-border bg-background text-foreground placeholder:text-muted-foreground focus:border-foreground h-11 w-full rounded-md border px-3 pr-10 text-sm transition-colors outline-none"
          />
          <button
            type="button"
            onClick={() => setShowConfirm((v) => !v)}
            aria-label={showConfirm ? "Hide password" : "Show password"}
            className="text-muted-foreground hover:text-foreground absolute top-1/2 right-3 -translate-y-1/2"
          >
            {showConfirm ? (
              <EyeOff className="h-4 w-4" />
            ) : (
              <Eye className="h-4 w-4" />
            )}
          </button>
        </div>
      </Field>

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
        Update password
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
