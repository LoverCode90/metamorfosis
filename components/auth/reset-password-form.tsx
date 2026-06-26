"use client"

import { Loader2 } from "lucide-react"

import { Button } from "@/components/ui/button"
import { PasswordField } from "@/components/auth/password-field"
import { PasswordStrength } from "@/components/ui/password-strength"
import { useResetPassword } from "@/hooks/use-reset-password"

/** Recovery-link password reset: new password + confirmation. */
export function ResetPasswordForm() {
  const { register, errors, isSubmitting, serverError, passwordValue, submit } =
    useResetPassword()

  return (
    <form onSubmit={submit} noValidate className="flex flex-col gap-4">
      <PasswordField
        label="New password"
        error={errors.password?.message}
        autoComplete="new-password"
        placeholder="Minimum 8 characters"
        {...register("password")}
      >
        <PasswordStrength password={passwordValue} />
      </PasswordField>

      <PasswordField
        label="Confirm new password"
        error={errors.confirmPassword?.message}
        autoComplete="new-password"
        placeholder="Repeat your new password"
        {...register("confirmPassword")}
      />

      {serverError && (
        <p
          role="alert"
          className="bg-destructive/10 text-destructive rounded-md px-3 py-2 text-sm"
        >
          {serverError}
        </p>
      )}

      <Button
        type="submit"
        disabled={isSubmitting}
        className="mt-1 h-11 w-full"
      >
        {isSubmitting && <Loader2 className="h-4 w-4 animate-spin" />}
        Update password
      </Button>
    </form>
  )
}
