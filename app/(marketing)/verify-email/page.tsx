import type { Metadata } from "next"
import { VerifyEmailForm } from "@/components/auth/verify-email-form"

export const metadata: Metadata = {
  title: "Verify your email — Metamorfosis Beauty",
}

export default function VerifyEmailPage() {
  return (
    <div className="flex min-h-[calc(100dvh-4rem)] items-center justify-center px-4 py-12">
      <div className="w-full max-w-sm">
        <div className="mb-8 text-center">
          <h1 className="text-foreground text-2xl font-semibold tracking-tight">
            Check your email
          </h1>
          <p className="text-muted-foreground mt-2 text-sm">
            Enter the 4-digit code we sent to your email address.
          </p>
        </div>
        <VerifyEmailForm />
      </div>
    </div>
  )
}
