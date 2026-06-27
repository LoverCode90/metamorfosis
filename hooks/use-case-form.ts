"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"

import {
  reasonsForItem,
  ruleForReason,
  type CaseReason,
} from "@/lib/profile/case-reasons"
import { submitCase } from "@/lib/profile/case-submit"
import type { DbOrder } from "@/lib/orders/types"

const MAX_PHOTOS = 3
const MIN_EXPLANATION = 40

// Maps substrings of known API errors to friendly, user-facing messages.
const CASE_ERROR_MESSAGES: Record<string, string> = {
  "Order not found": "We couldn't find this order on your account.",
  "confirmed or delivered": "This order isn't eligible for a return yet.",
  "within 14 days": "The 14-day window for reporting issues has passed.",
  "already exists": "You already have an open case for this order.",
  "cannot be returned due to shipping":
    "This item's value is below our $15 return minimum.",
  "At least one photo": "Please add at least one photo for this return.",
}

function friendlyError(message: string): string {
  const key = Object.keys(CASE_ERROR_MESSAGES).find((k) => message.includes(k))
  return key
    ? CASE_ERROR_MESSAGES[key]
    : "Something went wrong. Please try again."
}

export interface UseCaseFormResult {
  variationId: string
  selectVariation: (variationId: string) => void
  reason: string
  setReason: (reason: string) => void
  availableReasons: readonly CaseReason[]
  explanation: string
  setExplanation: (v: string) => void
  condition: string
  setCondition: (v: string) => void
  requireCondition: boolean
  files: File[]
  addFiles: (files: FileList) => void
  removeFile: (index: number) => void
  maxPhotos: number
  isSubmitting: boolean
  error: string
  canSubmit: boolean
  submit: (e: React.FormEvent) => Promise<void>
}

/**
 * Owns the report-a-problem form state: item/reason selection (reasons adapt
 * to the chosen item), explanation, item condition, required photo evidence,
 * and submission with friendly error mapping.
 * @param order - The order the case is filed against.
 */
export function useCaseForm(order: DbOrder): UseCaseFormResult {
  const router = useRouter()

  const findItem = (id: string) =>
    order.order_items.find((item) => item.variation_id === id)

  const [variationId, setVariationId] = useState(
    order.order_items[0]?.variation_id ?? "",
  )
  const availableReasons = reasonsForItem(findItem(variationId))
  const [reason, setReason] = useState<string>(availableReasons[0].value)
  const [explanation, setExplanation] = useState("")
  const [condition, setCondition] = useState("")
  const [files, setFiles] = useState<File[]>([])
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState("")

  const requireCondition = ruleForReason(reason).requireCondition

  function selectVariation(newVariationId: string) {
    setVariationId(newVariationId)
    const newReasons = reasonsForItem(findItem(newVariationId))
    if (!newReasons.some((r) => r.value === reason)) {
      setReason(newReasons[0].value)
    }
  }

  function addFiles(list: FileList) {
    const selected = Array.from(list)
    if (files.length + selected.length > MAX_PHOTOS) {
      setError(`Maximum ${MAX_PHOTOS} photos allowed.`)
      return
    }
    setError("")
    setFiles((prev) => [...prev, ...selected].slice(0, MAX_PHOTOS))
  }

  function removeFile(index: number) {
    setFiles((prev) => prev.filter((_, i) => i !== index))
  }

  async function submit(e: React.FormEvent) {
    e.preventDefault()
    setError("")
    if (explanation.length < MIN_EXPLANATION) {
      setError(`Explanation must be at least ${MIN_EXPLANATION} characters.`)
      return
    }
    if (files.length === 0) {
      setError("At least one photo is required to process your return.")
      return
    }

    setIsSubmitting(true)
    try {
      await submitCase({
        order,
        variationId,
        reason,
        explanation,
        condition,
        files,
      })
      router.refresh()
    } catch (err: unknown) {
      setError(friendlyError(err instanceof Error ? err.message : ""))
    } finally {
      setIsSubmitting(false)
    }
  }

  return {
    variationId,
    selectVariation,
    reason,
    setReason,
    availableReasons,
    explanation,
    setExplanation,
    condition,
    setCondition,
    requireCondition,
    files,
    addFiles,
    removeFile,
    maxPhotos: MAX_PHOTOS,
    isSubmitting,
    error,
    canSubmit:
      !isSubmitting &&
      explanation.length >= MIN_EXPLANATION &&
      files.length > 0 &&
      (!requireCondition || condition !== ""),
    submit,
  }
}
