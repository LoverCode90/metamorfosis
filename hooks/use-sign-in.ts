"use client"

import { useState } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { useRouter, useSearchParams } from "next/navigation"

import { signInWithPassword } from "@/lib/auth/auth-client"
import { SignInSchema, type SignInInput } from "@/lib/validation/schemas"

/**
 * Email/password sign-in form logic: validation, Supabase auth, the
 * show-password toggle, and redirect to `?next=` (or `/profile`) on success.
 */
export function useSignIn() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const nextPath = searchParams.get("next") ?? "/profile"

  const [serverError, setServerError] = useState<string | null>(null)
  const [showPassword, setShowPassword] = useState(false)

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<SignInInput>({ resolver: zodResolver(SignInSchema) })

  const submit = handleSubmit(async (data) => {
    setServerError(null)
    const { error } = await signInWithPassword(data.email, data.password)
    if (error) {
      setServerError("Incorrect email or password. Please try again.")
      return
    }
    router.push(nextPath.startsWith("/") ? nextPath : "/profile")
    router.refresh()
  })

  return {
    register,
    errors,
    isSubmitting,
    serverError,
    showPassword,
    togglePassword: () => setShowPassword((v) => !v),
    submit,
  }
}
