"use client"

import { useUser } from "@/hooks/use-user"
import { ProfileAddressSection } from "./profile-address-section"
import { ProfileSubpageShell } from "./profile-subpage-shell"

export function AddressesView() {
  const { user, dbProfile, profile, savedAddress, saveAddress, isLoading } =
    useUser()

  return (
    <ProfileSubpageShell
      title="Addresses"
      description="Your default shipping address."
      isLoading={isLoading}
    >
      <ProfileAddressSection
        savedAddress={savedAddress}
        saveAddress={saveAddress}
        user={user}
        email={dbProfile?.email ?? profile.email}
      />
    </ProfileSubpageShell>
  )
}
