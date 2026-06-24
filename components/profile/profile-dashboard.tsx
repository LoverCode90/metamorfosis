"use client"

import { Loader2, Lock, MapPin, Package, ShieldCheck, User } from "lucide-react"
import { useUser } from "@/hooks/use-user"
import { AvatarInitials } from "./avatar-initials"
import { ProfileBadges } from "./profile-badges"
import { ProfileNavRow } from "./profile-nav-row"
import { SignOutButton } from "@/components/auth/sign-out-button"

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

  // Profile-completion checklist drives the thin progress bar.
  const checklist = [
    hasName,
    Boolean(savedAddress),
    ...(!isAdmin ? [verificationStatus === "verified"] : []),
  ]
  const completion = Math.round(
    (checklist.filter(Boolean).length / checklist.length) * 100,
  )

  const rows = [
    {
      href: "/profile/personal",
      icon: User,
      title: "Personal Info",
      description: "Name, phone, email",
      show: true,
    },
    {
      href: "/profile/addresses",
      icon: MapPin,
      title: "Addresses",
      description: "Your shipping address",
      show: true,
    },
    {
      href: "/profile/security",
      icon: Lock,
      title: "Security",
      description: "Change your password",
      show: !isGoogleUser,
    },
    {
      href: "/orders",
      icon: Package,
      title: "Orders",
      description: "Your order history",
      show: true,
    },
    {
      href: "/profile/verification",
      icon: ShieldCheck,
      title: "Professional Verification",
      description: "License status",
      show: !isAdmin,
    },
  ].filter((row) => row.show)

  if (isLoading) {
    return (
      <div className="text-muted-foreground flex justify-center py-24">
        <Loader2 className="h-6 w-6 animate-spin" />
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-2xl px-4 py-8 sm:px-6 lg:py-12">
      {/* Header — centered avatar + name + email */}
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
          <ProfileBadges
            role={dbProfile?.role ?? "standard_customer"}
            verificationStatus={verificationStatus}
          />
        </div>
        <p className="text-muted-foreground mt-1 text-sm">{profile.email}</p>
      </div>

      {/* Thin profile-completion bar */}
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

      {/* Navigable rows */}
      <div className="mt-8 flex flex-col gap-3">
        {rows.map((row) => (
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
