"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"

import { resendVerificationCode, verifyEmailCode } from "@/lib/auth/auth-client"

const CODE_LENGTH = 4

/** Reads a sign-up value stashed in sessionStorage (client-only). */
function readSession(key: string): string | null {
  return typeof window !== "undefined" ? sessionStorage.getItem(key) : null
}

/**
 * Drives the email-verification screen: pending credentials (from sessionStorage),
 * the OTP value, submission, and resend. Redirects to /signup if credentials
 * are missing.
 */
export function useEmailVerification() {
  const router = useRouter()
  const [email] = useState(() => readSession("signup_email"))
  const [password] = useState(() => readSession("signup_password"))
  const [code, setCode] = useState<string[]>(Array(CODE_LENGTH).fill(""))
  const [error, setError] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)
  const [resending, setResending] = useState(false)
  const [resendMsg, setResendMsg] = useState<string | null>(null)

  useEffect(() => {
    if (!email || !password) router.replace("/signup")
  }, [email, password, router])

  async function verify(e: React.FormEvent) {
    e.preventDefault()
    if (!email || !password) return
    const fullCode = code.join("")
    if (fullCode.length !== CODE_LENGTH) {
      setError("Please enter the full 4-digit code.")
      return
    }

    setError(null)
    setSubmitting(true)
    const result = await verifyEmailCode(email, fullCode, password)
    if (!result.ok) {
      setError(result.error ?? "Verification failed. Please try again.")
      setSubmitting(false)
      return
    }

    sessionStorage.removeItem("signup_email")
    sessionStorage.removeItem("signup_password")
    router.push(result.redirect ?? "/profile")
    router.refresh()
  }

  async function resend() {
    if (!email) return
    setResending(true)
    setResendMsg(null)
    setError(null)
    const result = await resendVerificationCode(email)
    if (!result.ok) {
      setError(result.error ?? "Could not resend code. Please try again.")
    } else {
      setResendMsg("A new code has been sent to your email.")
      setCode(Array(CODE_LENGTH).fill(""))
    }
    setResending(false)
  }

  return {
    email,
    code,
    setCode,
    error,
    submitting,
    resending,
    resendMsg,
    verify,
    resend,
  }
}
