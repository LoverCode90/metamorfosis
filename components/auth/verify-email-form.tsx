"use client"

import Link from "next/link"
import { Loader2 } from "lucide-react"

import { Button } from "@/components/ui/button"
import { OtpInputGroup } from "@/components/auth/otp-input-group"
import { useEmailVerification } from "@/hooks/use-email-verification"

/** Sign-up email verification: 4-digit code entry, submit, and resend. */
export function VerifyEmailForm() {
  const {
    email,
    code,
    setCode,
    error,
    submitting,
    resending,
    resendMsg,
    verify,
    resend,
  } = useEmailVerification()

  if (!email) return null

  return (
    <div className="flex flex-col gap-6">
      <p className="text-muted-foreground text-center text-sm">
        Code sent to{" "}
        <span className="text-foreground font-medium">{email}</span>
      </p>

      <form onSubmit={verify} className="flex flex-col gap-6">
        <OtpInputGroup value={code} onChange={setCode} />

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

        <Button
          type="submit"
          disabled={submitting || code.join("").length !== 4}
          className="h-11 w-full"
        >
          {submitting && <Loader2 className="h-4 w-4 animate-spin" />}
          Verify email
        </Button>
      </form>

      <div className="text-muted-foreground flex items-center justify-between text-sm">
        <Button
          type="button"
          variant="link"
          size="sm"
          onClick={resend}
          disabled={resending}
          className="text-muted-foreground h-auto p-0"
        >
          {resending ? "Sending…" : "Resend code"}
        </Button>
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
