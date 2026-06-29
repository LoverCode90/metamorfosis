"use client"

import { useUser } from "@/hooks/use-user"
import { ProfileAddressSection } from "./profile-address-section"
import { ProfileSubpageShell } from "./profile-subpage-shell"

interface AddressesViewProps {
  from: string | null
  step: string | null
}

export function AddressesView({ from, step }: AddressesViewProps) {
  const { user, dbProfile, profile, savedAddress, saveAddress, isLoading } =
    useUser()

  const fromCheckout = from === "checkout"
  const backTarget = fromCheckout
    ? `/checkout?step=${step ?? "info"}`
    : "/profile"

  return (
    <ProfileSubpageShell
      title="Shipping Info"
      description="Name, phone &amp; shipping address"
      isLoading={isLoading}
      backHref={backTarget}
      backLabel={fromCheckout ? "Return to Checkout" : undefined}
    >
      <ProfileAddressSection
        savedAddress={savedAddress}
        saveAddress={saveAddress}
        user={user}
        email={dbProfile?.email ?? profile.email}
        fromCheckout={fromCheckout}
        step={step}
      />
    </ProfileSubpageShell>
  )
}
