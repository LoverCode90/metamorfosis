import { create } from "zustand"
import { persist } from "zustand/middleware"
import type { SavedAddress, UserProfile, VerificationStatus } from "@/lib/types"
import { sendEmail } from "@/lib/email"

const INITIAL_PROFILE: UserProfile = {
  name: "Ronald Richards",
  email: "ronald@example.com",
  location: "Los Angeles, CA",
  bio: "Independent colorist focused on dimensional blondes and bond-safe lightening. Building a private studio practice.",
  avatar: "/professional-hair-colorist-portrait.png",
  status: "regular",
}

const INITIAL_ADDRESS: SavedAddress = {
  fullName: "Ronald Richards",
  line1: "8721 Sunset Blvd, Suite 4",
  city: "Los Angeles",
  region: "CA",
  postalCode: "90069",
  country: "United States",
}

interface ProfileState {
  profile: UserProfile
  savedAddress: SavedAddress | null
  verificationStatus: VerificationStatus

  updateProfile: (patch: Partial<UserProfile>) => void
  saveAddress: (address: SavedAddress) => void
  submitVerification: () => void
  approveVerification: () => void
}

export const useProfileStore = create<ProfileState>()(
  persist(
    (set, get) => ({
      profile: INITIAL_PROFILE,
      savedAddress: INITIAL_ADDRESS,
      verificationStatus: INITIAL_PROFILE.status,

      updateProfile: (patch) => {
        const next = { ...get().profile, ...patch }
        void sendEmail({
          to: next.email,
          template: "profile.updated",
          data: { name: next.name },
        })
        set({ profile: next, verificationStatus: next.status })
      },

      saveAddress: (address) => {
        const location = `${address.city}, ${address.region}`
        void sendEmail({
          to: get().profile.email,
          template: "address.updated",
          data: { location },
        })
        set((state) => ({
          savedAddress: address,
          profile: { ...state.profile, location },
        }))
      },

      submitVerification: () => {
        const { profile } = get()
        if (profile.status === "verified") return
        void sendEmail({
          to: profile.email,
          template: "verification.pending",
          data: { name: profile.name },
        })
        const next = { ...profile, status: "pending" as VerificationStatus }
        set({ profile: next, verificationStatus: "pending" })
      },

      approveVerification: () => {
        const { profile } = get()
        void sendEmail({
          to: profile.email,
          template: "verification.approved",
          data: { name: profile.name },
        })
        const next = { ...profile, status: "verified" as VerificationStatus }
        set({ profile: next, verificationStatus: "verified" })
      },
    }),
    { name: "metamorfosis-profile" },
  ),
)
