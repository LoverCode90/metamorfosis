"use client"

import { ShieldCheck } from "lucide-react"
import { useUser } from "@/hooks/use-user"
import { ChangePasswordForm } from "./change-password-form"
import { ProfileSubpageShell } from "./profile-subpage-shell"

export function SecurityView() {
  const { user, isLoading } = useUser()
  const isGoogleUser = user?.app_metadata?.provider === "google"

  return (
    <ProfileSubpageShell
      title="Security"
      description="Manage how you sign in."
      isLoading={isLoading}
    >
      {isGoogleUser ? (
        <section className="border-border bg-card flex items-start gap-3 rounded-2xl border p-6">
          <ShieldCheck
            className="text-foreground mt-0.5 h-5 w-5 shrink-0"
            strokeWidth={2}
          />
          <div>
            <p className="text-foreground text-sm font-medium">
              Signed in with Google
            </p>
            <p className="text-muted-foreground mt-0.5 text-sm">
              Your password is managed by your Google account, so there&apos;s
              nothing to change here.
            </p>
          </div>
        </section>
      ) : (
        <ChangePasswordForm />
      )}
    </ProfileSubpageShell>
  )
}
