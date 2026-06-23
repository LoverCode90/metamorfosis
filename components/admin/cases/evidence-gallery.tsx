"use client"

import { useEffect, useState } from "react"
import { Loader2 } from "lucide-react"

export function EvidenceGallery({ caseId }: { caseId: string }) {
  const [urls, setUrls] = useState<string[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")

  useEffect(() => {
    const fetchEvidence = async () => {
      try {
        const res = await fetch(`/api/admin/cases/${caseId}/evidence`)
        if (!res.ok) {
          const data = await res.json()
          throw new Error(data.error || "Failed to load evidence")
        }
        const data = await res.json()
        setUrls(data.urls)
      } catch (err: any) {
        setError(err.message)
      } finally {
        setLoading(false)
      }
    }

    fetchEvidence()
  }, [caseId])

  if (loading) {
    return (
      <div className="flex items-center gap-2 text-muted-foreground text-sm">
        <Loader2 className="h-4 w-4 animate-spin" />
        Loading evidence...
      </div>
    )
  }

  if (error) {
    return <p className="text-destructive text-sm font-medium">{error}</p>
  }

  if (urls.length === 0) {
    return <p className="text-muted-foreground text-sm">No evidence photos provided.</p>
  }

  return (
    <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
      {urls.map((url, i) => (
        <a
          key={i}
          href={url}
          target="_blank"
          rel="noopener noreferrer"
          className="border-border relative block aspect-square overflow-hidden rounded-md border transition-opacity hover:opacity-90"
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={url}
            alt={`Evidence ${i + 1}`}
            className="h-full w-full object-cover"
          />
        </a>
      ))}
    </div>
  )
}
