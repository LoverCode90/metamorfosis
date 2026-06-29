"use client"

import { useEffect, useState } from "react"

import { createClient } from "@/lib/supabase/client"

/**
 * Resolves whether the current user clears the professional-products gate
 * (approved/verified license or admin). Returns null until known.
 */
export function useProGateStatus(userId: string | undefined): boolean | null {
  const [isVerifiedPro, setIsVerifiedPro] = useState<boolean | null>(null)

  useEffect(() => {
    let cancelled = false
    async function checkProStatus() {
      if (!userId) {
        if (!cancelled) setIsVerifiedPro(false)
        return
      }
      try {
        const supabase = createClient()
        const { data } = await supabase
          .from("profiles")
          .select("verification_status, role")
          .eq("id", userId)
          .single()
        if (cancelled) return
        setIsVerifiedPro(
          !!data &&
            (data.verification_status === "approved" ||
              data.verification_status === "verified" ||
              data.role === "admin"),
        )
      } catch {
        if (!cancelled) setIsVerifiedPro(false)
      }
    }
    void checkProStatus()
    return () => {
      cancelled = true
    }
  }, [userId])

  return isVerifiedPro
}
