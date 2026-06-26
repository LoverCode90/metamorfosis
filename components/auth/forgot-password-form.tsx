"use client"

import { Loader2 } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { AuthField } from "@/components/auth/auth-field"
import { useForgotPassword } from "@/hooks/use-forgot-password"

interface ForgotPasswordFormProps {
  onBack: () => void
}

/** Inline forgot-password request form with a success confirmation state. */
export function ForgotPasswordForm({ onBack }: ForgotPasswordFormProps) {
  const f = useForgotPassword()

  return (
    <div className="flex flex-col gap-4">
      <p className="text-muted-foreground text-sm">
        Enter your email and we&apos;ll send you a reset link if an account
        exists.
      </p>

      {f.done ? (
        <p className="border-border bg-muted/40 text-muted-foreground rounded-xl border px-5 py-4 text-sm">
          If that email has an account, you&apos;ll receive a reset link
          shortly.
        </p>
      ) : (
        <form onSubmit={f.submit} className="flex flex-col gap-4">
          <AuthField label="Email address">
            <Input
              type="email"
              autoComplete="email"
              placeholder="you@example.com"
              value={f.email}
              onChange={(e) => f.setEmail(e.target.value)}
              required
              className="h-11"
            />
          </AuthField>

          {f.error && (
            <p
              role="alert"
              className="bg-destructive/10 text-destructive rounded-md px-3 py-2 text-sm"
            >
              {f.error}
            </p>
          )}

          <Button
            type="submit"
            disabled={f.submitting || !f.email}
            className="h-11 w-full"
          >
            {f.submitting && <Loader2 className="h-4 w-4 animate-spin" />}
            Send reset link
          </Button>
        </form>
      )}

      <Button
        variant="ghost"
        onClick={onBack}
        className="text-muted-foreground"
      >
        ← Back to sign in
      </Button>
    </div>
  )
}
