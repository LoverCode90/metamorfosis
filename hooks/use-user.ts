"use client"

import { useCallback, useEffect, useState } from "react"
import type { User } from "@supabase/supabase-js"
import { createClient } from "@/lib/supabase/client"
import { mapDbProfile, mapVerificationStatus } from "@/lib/auth/mappers"
import { useAddressStore } from "@/stores/profile"
import type {
  DbProfile,
  SavedAddress,
  UserProfile,
  VerificationStatus,
} from "@/lib/types"

const DEFAULT_PROFILE: UserProfile = {
  name: "",
  email: "",
  location: "",
  bio: "",
  avatar: "/professional-hair-colorist-portrait.png",
  status: "regular",
}

interface UseUserResult {
  user: User | null
  profile: UserProfile
  savedAddress: SavedAddress | null
  verificationStatus: VerificationStatus
  isVerified: boolean
  isPending: boolean
  isLoading: boolean
  updateProfile: (
    patch: Partial<Pick<DbProfile, "full_name" | "bio" | "business_name">>,
  ) => Promise<void>
  saveAddress: (address: SavedAddress) => void
  submitVerification: () => Promise<void>
  signOut: () => Promise<void>
}

export function useUser(): UseUserResult {
  const supabase = createClient()
  const { savedAddress, saveAddress, clearAddress } = useAddressStore()
  const [user, setUser] = useState<User | null>(null)
  const [profile, setProfile] = useState<UserProfile>(DEFAULT_PROFILE)
  const [verificationStatus, setVerificationStatus] =
    useState<VerificationStatus>("regular")
  const [isLoading, setIsLoading] = useState(true)

  const fetchProfile = useCallback(
    async (uid: string) => {
      const { data } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", uid)
        .single<DbProfile>()

      if (data) {
        setProfile(mapDbProfile(data))
        setVerificationStatus(mapVerificationStatus(data.verification_status))
      }
    },
    [supabase],
  )

  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user: u } }) => {
      setUser(u)
      if (u) {
        fetchProfile(u.id).finally(() => setIsLoading(false))
      } else {
        setIsLoading(false)
      }
    })

    const { data: listener } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        const u = session?.user ?? null
        setUser(u)
        if (u) {
          fetchProfile(u.id)
        } else {
          setProfile(DEFAULT_PROFILE)
          setVerificationStatus("regular")
          clearAddress()
        }
      },
    )

    return () => listener.subscription.unsubscribe()
  }, [supabase, fetchProfile, clearAddress])

  const updateProfile = useCallback(
    async (
      patch: Partial<Pick<DbProfile, "full_name" | "bio" | "business_name">>,
    ) => {
      if (!user) return
      const { data } = await supabase
        .from("profiles")
        .update(patch)
        .eq("id", user.id)
        .select()
        .single<DbProfile>()

      if (data) {
        setProfile(mapDbProfile(data))
        setVerificationStatus(mapVerificationStatus(data.verification_status))
      }
    },
    [user, supabase],
  )

  const submitVerification = useCallback(async () => {
    if (!user) return
    const { data } = await supabase
      .from("profiles")
      .update({ verification_status: "pending_review" })
      .eq("id", user.id)
      .select()
      .single<DbProfile>()

    if (data) {
      setProfile(mapDbProfile(data))
      setVerificationStatus("pending")
    }
  }, [user, supabase])

  const signOut = useCallback(async () => {
    await fetch("/api/auth/signout", { method: "POST" })
  }, [])

  return {
    user,
    profile,
    savedAddress,
    verificationStatus,
    isVerified: verificationStatus === "verified",
    isPending: verificationStatus === "pending",
    isLoading,
    updateProfile,
    saveAddress,
    submitVerification,
    signOut,
  }
}
