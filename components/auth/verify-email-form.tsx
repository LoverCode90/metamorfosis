"use client"

import { useEffect, useRef, useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Loader2 } from "lucide-react"

export function VerifyEmailForm() {
  const router = useRouter()
  const [email] = useState<string | null>(() =>
    typeof window !== "undefined"
      ? sessionStorage.getItem("signup_email")
      : null,
  )
  const [password] = useState<string | null>(() =>
    typeof window !== "undefined"
      ? sessionStorage.getItem("signup_password")
      : null,
  )
  const [code, setCode] = useState(["", "", "", ""])
  const [error, setError] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)
  const [resending, setResending] = useState(false)
  const [resendMsg, setResendMsg] = useState<string | null>(null)
  const inputRefs = useRef<Array<HTMLInputElement | null>>([])

  useEffect(() => {
    if (!email || !password) {
      router.replace("/signup")
    }
  }, [email, password, router])

  function handleDigit(index: number, value: string) {
    const digit = value.replace(/\D/g, "").slice(-1)
    const next = [...code]
    next[index] = digit
    setCode(next)
    if (digit && index < 3) {
      inputRefs.current[index + 1]?.focus()
    }
  }

  function handleKeyDown(index: number, e: React.KeyboardEvent) {
    if (e.key === "Backspace" && !code[index] && index > 0) {
      inputRefs.current[index - 1]?.focus()
    }
  }

  function handlePaste(e: React.ClipboardEvent) {
    const pasted = e.clipboardData
      .getData("text")
      .replace(/\D/g, "")
      .slice(0, 4)
    if (pasted.length === 4) {
      setCode(pasted.split(""))
      inputRefs.current[3]?.focus()
    }
    e.preventDefault()
  }

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!email || !password) return
    const fullCode = code.join("")
    if (fullCode.length !== 4) {
      setError("Please enter the full 4-digit code.")
      return
    }

    setError(null)
    setSubmitting(true)

    const res = await fetch("/api/auth/verify-email", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, code: fullCode, password }),
    })

    const body = (await res.json().catch(() => ({}))) as {
      ok?: boolean
      redirect?: string
      error?: string
    }

    if (!res.ok) {
      setError(body.error ?? "Verification failed. Please try again.")
      setSubmitting(false)
      return
    }

    // Clear credentials from sessionStorage
    sessionStorage.removeItem("signup_email")
    sessionStorage.removeItem("signup_password")

    router.push(body.redirect ?? "/profile")
    router.refresh()
  }

  async function onResend() {
    if (!email) return
    setResending(true)
    setResendMsg(null)
    setError(null)

    const res = await fetch("/api/auth/resend-code", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email }),
    })

    const body = (await res.json().catch(() => ({}))) as { error?: string }

    if (!res.ok) {
      setError(body.error ?? "Could not resend code. Please try again.")
    } else {
      setResendMsg("A new code has been sent to your email.")
      setCode(["", "", "", ""])
      inputRefs.current[0]?.focus()
    }
    setResending(false)
  }

  if (!email) return null

  return (
    <div className="flex flex-col gap-6">
      <p className="text-muted-foreground text-center text-sm">
        Code sent to{" "}
        <span className="text-foreground font-medium">{email}</span>
      </p>

      <form onSubmit={onSubmit} className="flex flex-col gap-6">
        <div className="flex justify-center gap-3" onPaste={handlePaste}>
          {code.map((digit, i) => (
            <input
              key={i}
              ref={(el) => {
                inputRefs.current[i] = el
              }}
              type="text"
              inputMode="numeric"
              maxLength={1}
              value={digit}
              onChange={(e) => handleDigit(i, e.target.value)}
              onKeyDown={(e) => handleKeyDown(i, e)}
              className="border-border bg-background text-foreground focus:border-foreground h-14 w-14 rounded-xl border text-center text-2xl font-semibold transition-colors outline-none"
              aria-label={`Digit ${i + 1}`}
            />
          ))}
        </div>

        {error && (
          <p
            role="alert"
            className="bg-destructive/10 text-destructive rounded-md px-3 py-2 text-center text-sm"
          >
            {error}
          </p>
        )}

        {resendMsg && (
          <p className="text-center text-sm text-emerald-600">{resendMsg}</p>
        )}

        <button
          type="submit"
          disabled={submitting || code.join("").length !== 4}
          className="bg-foreground text-background flex h-11 w-full items-center justify-center gap-2 rounded-md text-sm font-semibold transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {submitting ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
          Verify email
        </button>
      </form>

      <div className="text-muted-foreground flex items-center justify-between text-sm">
        <button
          type="button"
          onClick={onResend}
          disabled={resending}
          className="hover:text-foreground transition-colors disabled:opacity-50"
        >
          {resending ? "Sending…" : "Resend code"}
        </button>
        <Link
          href="/signup"
          className="hover:text-foreground transition-colors"
        >
          Use a different email
        </Link>
      </div>
    </div>
  )
}
