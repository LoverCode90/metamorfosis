import { create } from "zustand"
import { persist } from "zustand/middleware"
import type { SavedAddress } from "@/lib/types"

/**
 * Persisted store for locally-cached address data.
 * Auth state and profile data live in `hooks/use-user.ts` via Supabase.
 */
interface AddressState {
  savedAddress: SavedAddress | null
  saveAddress: (address: SavedAddress) => void
  clearAddress: () => void
}

export const useAddressStore = create<AddressState>()(
  persist(
    (set) => ({
      savedAddress: null,
      saveAddress: (address) => set({ savedAddress: address }),
      clearAddress: () => set({ savedAddress: null }),
    }),
    { name: "metamorfosis-address" },
  ),
)
