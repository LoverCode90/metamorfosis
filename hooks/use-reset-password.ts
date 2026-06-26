"use client"

import { useState } from "react"
import { useForm, useWatch } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { useSearchParams } from "next/navigation"

import { resetPassword } from "@/lib/auth/auth-client"
import {
  ResetPasswordSchema,
  type ResetPasswordInput,
} from "@/lib/validation/schemas"

/**
 * Reset-password form logic: validation, recovery-token handling, the live
 * password value (for the strength meter), and submission.
 */
export function useResetPassword() {
  const searchParams = useSearchParams()
  const tokenHash = searchParams.get("token_hash")
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

  const submit = handleSubmit(async (data) => {
    if (!tokenHash) {
      setServerError(
        "Invalid or missing recovery token. Please request a new link.",
      )
      return
    }
    setServerError(null)
    const result = await resetPassword(tokenHash, data.password)
    if (!result.ok) {
      setServerError(
        result.error ?? "Could not update your password. Please try again.",
      )
      return
    }
    window.location.assign("/")
  })

  return { register, errors, isSubmitting, serverError, passwordValue, submit }
}
