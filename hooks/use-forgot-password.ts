"use client"

import { useState } from "react"

import { requestPasswordReset } from "@/lib/auth/auth-client"

/** Inline forgot-password request state: email, submit, and success/error. */
export function useForgotPassword() {
  const [email, setEmail] = useState("")
  const [submitting, setSubmitting] = useState(false)
  const [done, setDone] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function submit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)
    setSubmitting(true)
    const result = await requestPasswordReset(email)
    if (!result.ok) {
      setError(result.error ?? "Something went wrong. Please try again.")
      setSubmitting(false)
      return
    }
    setDone(true)
    setSubmitting(false)
  }

  return { email, setEmail, submitting, done, error, submit }
}
