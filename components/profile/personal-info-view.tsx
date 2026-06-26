"use client"

import { useUser } from "@/hooks/use-user"
import { ProfileInfoSection } from "./profile-info-section"
import { ProfileSubpageShell } from "./profile-subpage-shell"

export function PersonalInfoView() {
  const { profile, dbProfile, updateProfile, isLoading } = useUser()

  return (
    <ProfileSubpageShell
      title="Personal Info"
      description="Your name and email."
      isLoading={isLoading}
    >
      <div className="flex flex-col gap-4">
        <ProfileInfoSection profile={profile} updateProfile={updateProfile} />
      </div>
    </ProfileSubpageShell>
  )
}
