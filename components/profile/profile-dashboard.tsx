"use client"

import { Loader2 } from "lucide-react"

import { useUser } from "@/hooks/use-user"
import { AvatarInitials } from "./avatar-initials"
import { ProfileNavRow } from "./profile-nav-row"
import { SignOutButton } from "@/components/auth/sign-out-button"
import {
  PROFILE_NAV_ROWS,
  computeCompletionPercent,
} from "@/lib/profile/dashboard-nav"

export function ProfileDashboard() {
  const {
    user,
    profile,
    dbProfile,
    verificationStatus,
    savedAddress,
    isLoading,
  } = useUser()

  const isAdmin = dbProfile?.role === "admin"
  const isGoogleUser = user?.app_metadata?.provider === "google"
  const hasName =
    profile.firstName.trim().length > 0 && profile.lastName.trim().length > 0

  const completion = computeCompletionPercent({
    hasName,
    hasAddress: Boolean(savedAddress),
    isAdmin,
    isVerified: verificationStatus === "verified",
  })
  const visibleRows = PROFILE_NAV_ROWS.filter(
    (row) => row.isVisible?.({ isAdmin, isGoogleUser }) ?? true,
  )

  if (isLoading) {
    return (
      <div className="text-muted-foreground flex justify-center py-24">
        <Loader2 className="h-6 w-6 animate-spin" />
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-2xl px-4 py-8 sm:px-6 lg:py-12">
      <div className="flex flex-col items-center text-center">
        <AvatarInitials
          firstName={profile.firstName}
          lastName={profile.lastName}
          size={96}
        />
        <div className="mt-4 flex flex-wrap items-center justify-center gap-2">
          <h1 className="text-foreground text-xl font-semibold tracking-tight">
            {profile.name || "Your name"}
          </h1>
        </div>
        <p className="text-muted-foreground mt-1 text-sm">{profile.email}</p>
      </div>

      {completion < 100 && (
        <div className="mt-8">
          <div className="text-muted-foreground mb-2 flex items-center justify-between text-xs font-medium">
            <span>Complete your profile</span>
            <span>{completion}%</span>
          </div>
          <div className="bg-muted h-1.5 w-full overflow-hidden rounded-full">
            <div
              className="bg-accent-violet h-full rounded-full transition-all"
              style={{ width: `${completion}%` }}
            />
          </div>
        </div>
      )}

      <div className="mt-8 flex flex-col gap-3">
        {visibleRows.map((row) => (
          <ProfileNavRow
            key={row.href}
            href={row.href}
            icon={row.icon}
            title={row.title}
            description={row.description}
          />
        ))}
      </div>

      <div className="mt-8 flex justify-center">
        <SignOutButton />
      </div>
    </div>
  )
}
