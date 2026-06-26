"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"

import { reasonsForItem, type CaseReason } from "@/lib/profile/case-reasons"
import { submitCase } from "@/lib/profile/case-submit"
import type { DbOrder } from "@/lib/orders/types"

const MAX_PHOTOS = 3
const MIN_EXPLANATION = 40

export interface UseCaseFormResult {
  variationId: string
  selectVariation: (variationId: string) => void
  reason: string
  setReason: (reason: string) => void
  availableReasons: readonly CaseReason[]
  explanation: string
  setExplanation: (v: string) => void
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
 * to the chosen item), explanation, photo evidence, and submission.
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
  const [files, setFiles] = useState<File[]>([])
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState("")

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

    setIsSubmitting(true)
    try {
      await submitCase({ order, variationId, reason, explanation, files })
      router.refresh()
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Something went wrong")
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
    files,
    addFiles,
    removeFile,
    maxPhotos: MAX_PHOTOS,
    isSubmitting,
    error,
    canSubmit: !isSubmitting && explanation.length >= MIN_EXPLANATION,
    submit,
  }
}
