"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Loader2 } from "lucide-react"

interface CaseActionsProps {
  caseId: string
  isReturnable: boolean
  status: string
}

export function CaseActions({ caseId, isReturnable, status }: CaseActionsProps) {
  const router = useRouter()
  const [isProcessing, setIsProcessing] = useState<string | null>(null)
  const [error, setError] = useState("")

  const handleAction = async (action: string) => {
    setIsProcessing(action)
    setError("")

    try {
      const res = await fetch(`/api/admin/cases/${caseId}/${action}`, {
        method: "POST",
      })

      if (!res.ok) {
        const data = await res.json()
        throw new Error(data.error || `Failed to ${action}`)
      }

      router.refresh()
    } catch (err: any) {
      setError(err.message)
    } finally {
      setIsProcessing(null)
    }
  }

  if (status === "closed" || status === "rejected" || status === "approved") {
    return null
  }

  return (
    <div className="space-y-4">
      {error && (
        <div className="bg-destructive/10 text-destructive rounded-md p-3 text-sm font-medium">
          {error}
        </div>
      )}
      <div className="flex flex-wrap gap-3">
        <Button
          onClick={() => handleAction("approve-refund")}
          disabled={!!isProcessing}
          className="bg-green-600 hover:bg-green-700 text-white"
        >
          {isProcessing === "approve-refund" && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          Approve Refund
        </Button>

        {isReturnable && (
          <Button
            onClick={() => handleAction("generate-label")}
            disabled={!!isProcessing}
            variant="outline"
          >
            {isProcessing === "generate-label" && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Generate Return Label
          </Button>
        )}

        <Button
          onClick={() => handleAction("request-info")}
          disabled={!!isProcessing}
          variant="outline"
        >
          {isProcessing === "request-info" && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          Request More Info
        </Button>

        <Button
          onClick={() => handleAction("reject")}
          disabled={!!isProcessing}
          variant="destructive"
        >
          {isProcessing === "reject" && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          Reject Case
        </Button>
      </div>
    </div>
  )
}
