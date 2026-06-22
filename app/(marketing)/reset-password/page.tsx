import type { Metadata } from "next"
import { Suspense } from "react"
import { ResetPasswordForm } from "@/components/auth/reset-password-form"

export const metadata: Metadata = {
  title: "Reset password — Metamorfosis Beauty",
}

export default function ResetPasswordPage() {
  return (
    <div className="flex min-h-[calc(100dvh-4rem)] items-center justify-center px-4 py-12">
      <div className="w-full max-w-sm">
        <div className="mb-8 text-center">
          <h1 className="text-foreground text-2xl font-semibold tracking-tight">
            Set a new password
          </h1>
          <p className="text-muted-foreground mt-2 text-sm">
            Choose a strong password for your account.
          </p>
        </div>
        <Suspense
          fallback={
            <div className="flex justify-center py-8">
              <div className="border-foreground h-6 w-6 animate-spin rounded-full border-b-2"></div>
            </div>
          }
        >
          <ResetPasswordForm />
        </Suspense>
      </div>
    </div>
  )
}
