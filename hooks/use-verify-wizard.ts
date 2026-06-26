"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"

import { useUser } from "@/hooks/use-user"
import { useCartStore } from "@/stores/cart"
import {
  getLicenseHelperText,
  validateLicenseNumber,
} from "@/lib/validation/schemas"
import { uploadLicense } from "@/lib/profile/license-upload"
import type {
  LicenseInfo,
  UploadedFile,
} from "@/components/profile/verify-steps"

export type WizardStep = "info" | "upload" | "summary"
export type VerifyPhase =
  | "idle"
  | "processing"
  | "success"
  | "pending"
  | "rejected"

export const STEP_ORDER: WizardStep[] = ["info", "upload", "summary"]

export interface UseVerifyWizardResult {
  step: WizardStep
  stepIndex: number
  info: LicenseInfo
  setInfo: (info: LicenseInfo) => void
  file: UploadedFile | null
  setFile: (file: UploadedFile | null) => void
  phase: VerifyPhase
  rejectionReason: string
  licenseError: string | null
  licenseHelperText: string
  /** Whether the current step's requirements are satisfied. */
  canContinue: boolean
  next: () => void
  back: () => void
  confirm: () => Promise<void>
  retry: () => void
  cancel: () => void
}

/**
 * Drives the professional-license verification wizard: step navigation, form
 * state, document submission, and post-result routing. Keeps the page purely
 * presentational.
 */
export function useVerifyWizard(): UseVerifyWizardResult {
  const router = useRouter()
  const { refetchProfile } = useUser()
  const hasProItems = useCartStore((s) => s.hasProItems)

  const [step, setStep] = useState<WizardStep>("info")
  const [info, setInfo] = useState<LicenseInfo>({
    businessName: "",
    licenseNumber: "",
    country: "United States",
    profession: "Cosmetologist",
  })
  const [file, setFile] = useState<UploadedFile | null>(null)
  const [phase, setPhase] = useState<VerifyPhase>("idle")
  const [rejectionReason, setRejectionReason] = useState("")

  const stepIndex = STEP_ORDER.indexOf(step)

  // Only compute a format error when non-empty; empty is blocked by canContinue.
  const licenseError =
    info.licenseNumber.trim().length > 0
      ? validateLicenseNumber(info.profession, info.licenseNumber.trim())
      : null
  const licenseHelperText = getLicenseHelperText(info.profession)

  const canContinue =
    step === "info"
      ? info.licenseNumber.trim() !== "" && licenseError === null
      : step === "upload"
        ? file !== null
        : true

  function next() {
    if (step === "info") setStep("upload")
    else if (step === "upload") setStep("summary")
  }

  function back() {
    if (step === "summary") setStep("upload")
    else if (step === "upload") setStep("info")
  }

  async function confirm() {
    if (!file) return
    setPhase("processing")

    try {
      const result = await uploadLicense(info, file)
      if (!result.ok) {
        setRejectionReason(result.error ?? "Upload failed. Please try again.")
        setPhase("rejected")
        return
      }

      await refetchProfile()

      if (result.status === "approved") {
        setPhase("success")
        setTimeout(() => {
          router.push(hasProItems ? "/checkout" : "/products")
        }, 2000)
      } else if (result.status === "rejected") {
        setRejectionReason(result.message)
        setPhase("rejected")
      } else {
        setPhase("pending")
        setTimeout(() => router.push("/profile"), 3000)
      }
    } catch {
      setRejectionReason("A network error occurred. Please try again.")
      setPhase("rejected")
    }
  }

  function retry() {
    setPhase("idle")
    setFile(null)
    setStep("upload")
    setRejectionReason("")
  }

  function cancel() {
    router.push("/cart")
  }

  return {
    step,
    stepIndex,
    info,
    setInfo,
    file,
    setFile,
    phase,
    rejectionReason,
    licenseError,
    licenseHelperText,
    canContinue,
    next,
    back,
    confirm,
    retry,
    cancel,
  }
}
