"use client"

import { useState } from "react"

import { fetchDocumentUrl } from "@/lib/admin/verifications-api"

/**
 * Opens a verification's license document in a new tab via a signed URL.
 * @param verificationId - The verification whose document to open.
 */
export function useVerificationDocument(verificationId: string) {
  const [isLoading, setIsLoading] = useState(false)

  async function viewDocument() {
    setIsLoading(true)
    try {
      const url = await fetchDocumentUrl(verificationId)
      if (url) window.open(url, "_blank", "noopener,noreferrer")
    } finally {
      setIsLoading(false)
    }
  }

  return { isLoading, viewDocument }
}
