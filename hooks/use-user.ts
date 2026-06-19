"use client"

import { useProfileStore } from "@/stores/profile"

/**
 * Hook that surfaces profile + auth state.
 * In Phase 5 this will wrap Supabase Auth; for now it delegates to the
 * Zustand profile store so component API stays stable across phases.
 */
export function useUser() {
  const {
    profile,
    savedAddress,
    verificationStatus,
    updateProfile,
    saveAddress,
    submitVerification,
    approveVerification,
  } = useProfileStore()

  return {
    profile,
    savedAddress,
    verificationStatus,
    isVerified: verificationStatus === "verified",
    isPending: verificationStatus === "pending",
    updateProfile,
    saveAddress,
    submitVerification,
    approveVerification,
  }
}
