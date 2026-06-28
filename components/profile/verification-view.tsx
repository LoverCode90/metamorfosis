"use client"

import { useUser } from "@/hooks/use-user"
import { VerificationPanel } from "./verification-panel"
import { ProfileSubpageShell } from "./profile-subpage-shell"
import { PRO_RESTRICTIONS_ENABLED } from "@/lib/constants"

export function VerificationView() {
  const { dbProfile, verificationStatus, isLoading } = useUser()

  if (!PRO_RESTRICTIONS_ENABLED) return null

  return (
    <ProfileSubpageShell
      title="Professional Verification"
      description="Status of your cosmetology or salon license."
      isLoading={isLoading}
    >
      <VerificationPanel
        status={verificationStatus}
        rejectionReason={dbProfile?.rejection_reason}
      />
    </ProfileSubpageShell>
  )
}
