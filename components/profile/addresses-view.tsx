"use client"

import { useUser } from "@/hooks/use-user"
import { ProfileAddressSection } from "./profile-address-section"
import { ProfileSubpageShell } from "./profile-subpage-shell"

interface AddressesViewProps {
  from: string | null
}

export function AddressesView({ from }: AddressesViewProps) {
  const { user, dbProfile, profile, savedAddress, saveAddress, isLoading } =
    useUser()

  const fromCheckout = from === "checkout"

  return (
    <ProfileSubpageShell
      title="Shipping Info"
      description="Name, phone & shipping address"
      isLoading={isLoading}
      backHref={fromCheckout ? "/checkout" : "/profile"}
      backLabel={fromCheckout ? "Return to Checkout" : undefined}
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
