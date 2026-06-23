"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Upload, X, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { createClient } from "@/lib/supabase/client"
import type { DbOrder } from "@/lib/orders/types"
import { cn } from "@/lib/utils"

const REASONS = [
  { value: "damaged", label: "Arrived damaged" },
  { value: "wrong_item", label: "Wrong item received" },
  { value: "defective", label: "Item is defective" },
  { value: "not_as_described", label: "Not as described" },
  { value: "no_longer_needed", label: "No longer needed" },
  { value: "ordered_by_mistake", label: "Ordered by mistake" },
  { value: "other", label: "Other" },
]

export function CaseForm({ order }: { order: DbOrder }) {
  const router = useRouter()
  const [variationId, setVariationId] = useState(order.order_items[0]?.variation_id ?? "")
  const [reason, setReason] = useState(REASONS[0].value)
  const [explanation, setExplanation] = useState("")
  const [files, setFiles] = useState<File[]>([])
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState("")

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const selected = Array.from(e.target.files)
      if (files.length + selected.length > 3) {
        setError("Maximum 3 photos allowed.")
        return
      }
      setError("")
      setFiles((prev) => [...prev, ...selected].slice(0, 3))
    }
  }

  const removeFile = (index: number) => {
    setFiles((prev) => prev.filter((_, i) => i !== index))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")

    if (explanation.length < 100) {
      setError("Explanation must be at least 100 characters.")
      return
    }

    setIsSubmitting(true)

    try {
      const supabase = createClient()
      const caseId = crypto.randomUUID()
      const evidenceUrls: string[] = []

      for (let i = 0; i < files.length; i++) {
        const file = files[i]
        const ext = file.name.split(".").pop()
        const path = `${caseId}/${i + 1}.${ext}`

        const { error: uploadErr } = await supabase.storage
          .from("case-evidence")
          .upload(path, file)

        if (uploadErr) throw new Error(uploadErr.message)

        evidenceUrls.push(path)
      }

      const res = await fetch("/api/profile/cases", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: caseId, // optional if backend ignores it, but good to link files
          orderId: order.id,
          variationId,
          reason,
          explanation,
          evidenceUrls,
        }),
      })

      if (!res.ok) {
        const data = await res.json()
        throw new Error(data.error || "Failed to submit case")
      }

      router.refresh()
    } catch (err: any) {
      setError(err.message)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="mx-auto max-w-2xl space-y-6 py-8">
      <div>
        <h2 className="text-foreground text-2xl font-semibold tracking-tight">
          Report a Problem
        </h2>
        <p className="text-muted-foreground mt-1 text-sm">
          Select an item and provide details. We'll help you resolve this issue.
        </p>
      </div>

      {error && (
        <div className="bg-destructive/10 text-destructive rounded-md p-3 text-sm font-medium">
          {error}
        </div>
      )}

      <div className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="variationId">Which item?</Label>
          <select
            id="variationId"
            value={variationId}
            onChange={(e) => setVariationId(e.target.value)}
            className="border-border bg-background text-foreground flex h-10 w-full items-center justify-between rounded-md border px-3 py-2 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
            required
          >
            {order.order_items.map((item) => (
              <option key={item.id} value={item.variation_id}>
                {item.quantity}x {item.product_variations?.name_en ?? "Item"}
              </option>
            ))}
          </select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="reason">Reason</Label>
          <select
            id="reason"
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            className="border-border bg-background text-foreground flex h-10 w-full items-center justify-between rounded-md border px-3 py-2 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
            required
          >
            {REASONS.map((r) => (
              <option key={r.value} value={r.value}>
                {r.label}
              </option>
            ))}
          </select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="explanation">Explanation (minimum 100 characters)</Label>
          <textarea
            id="explanation"
            value={explanation}
            onChange={(e) => setExplanation(e.target.value)}
            className="border-border bg-background text-foreground flex min-h-[120px] w-full rounded-md border px-3 py-2 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
            placeholder="Please describe the issue in detail..."
            minLength={100}
            required
          />
          <p className="text-muted-foreground text-xs text-right">
            {explanation.length} / 100
          </p>
        </div>

        <div className="space-y-2">
          <Label>Photos (Optional, max 3)</Label>
          <div className="grid gap-4 sm:grid-cols-3">
            {files.map((file, i) => (
              <div
                key={i}
                className="border-border relative flex aspect-square items-center justify-center overflow-hidden rounded-md border"
              >
                <img
                  src={URL.createObjectURL(file)}
                  alt="Preview"
                  className="h-full w-full object-cover"
                />
                <button
                  type="button"
                  onClick={() => removeFile(i)}
                  className="bg-background/80 hover:bg-background absolute right-1 top-1 rounded-full p-1 transition-colors"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            ))}
            {files.length < 3 && (
              <label className="border-border text-muted-foreground hover:bg-muted/50 flex aspect-square cursor-pointer flex-col items-center justify-center gap-2 rounded-md border border-dashed transition-colors">
                <Upload className="h-5 w-5" />
                <span className="text-xs font-medium">Add Photo</span>
                <input
                  type="file"
                  accept="image/jpeg,image/png,image/webp"
                  className="hidden"
                  onChange={handleFileChange}
                  multiple
                />
              </label>
            )}
          </div>
        </div>
      </div>

      <Button
        type="submit"
        className="w-full"
        disabled={isSubmitting || explanation.length < 100}
      >
        {isSubmitting ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Submitting...
          </>
        ) : (
          "Submit Case"
        )}
      </Button>
    </form>
  )
}
