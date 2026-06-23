import { MapPin } from "lucide-react"
import type { UserProfile, UserRole, VerificationStatus } from "@/lib/types"
import { AvatarInitials } from "./avatar-initials"
import { ProfileBadges } from "./profile-badges"

interface ProfileHeaderProps {
  profile: UserProfile
  role: UserRole
  verificationStatus: VerificationStatus
}

export function ProfileHeader({
  profile,
  role,
  verificationStatus,
}: ProfileHeaderProps) {
  return (
    <section className="border-border bg-card flex flex-col gap-5 rounded-2xl border p-6 sm:flex-row sm:items-center">
      <AvatarInitials
        firstName={profile.firstName}
        lastName={profile.lastName}
        size={80}
      />
      <div className="min-w-0 flex-1">
        <div className="flex flex-wrap items-center gap-2">
          <h2 className="text-foreground text-lg font-semibold">
            {profile.name || "Your name"}
          </h2>
          <ProfileBadges role={role} verificationStatus={verificationStatus} />
        </div>
        <p className="text-muted-foreground mt-0.5 text-sm">{profile.email}</p>
        {profile.location && (
          <p className="text-muted-foreground mt-0.5 inline-flex items-center gap-1 text-sm">
            <MapPin className="h-3.5 w-3.5" strokeWidth={1.75} />
            {profile.location}
          </p>
        )}
      </div>
    </section>
  )
}
