"use client"

import { useState } from "react"
import { AlertCircle, Check, Loader2, RefreshCw } from "lucide-react"
import { useRouter } from "next/navigation"
import { useUser } from "@/hooks/use-user"
import { useCartStore } from "@/stores/cart"
import {
  validateLicenseNumber,
  getLicenseHelperText,
} from "@/lib/validation/schemas"
import {
  InfoStep,
  UploadStep,
  SummaryStep,
  VerifyStepIndicator,
  type LicenseInfo,
  type UploadedFile,
} from "./verify-steps"

type WizardStep = "info" | "upload" | "summary"
type Phase = "idle" | "processing" | "success" | "pending" | "rejected"

const STEP_ORDER: WizardStep[] = ["info", "upload", "summary"]

export function VerifyPage() {
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
  const [phase, setPhase] = useState<Phase>("idle")
  const [rejectionReason, setRejectionReason] = useState<string>("")

  const stepIndex = STEP_ORDER.indexOf(step)

  // Only compute format error when the field is non-empty; empty field is already
  // blocked by the licenseNumber.trim() !== "" check in canContinue.
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

  async function handleConfirm() {
    if (!file) return
    setPhase("processing")

    try {
      const formData = new FormData()
      formData.append("file", file.file)
      formData.append("profession", info.profession)
      formData.append("licenseNumber", info.licenseNumber)
      if (info.businessName) formData.append("businessName", info.businessName)

      const res = await fetch("/api/profile/license/upload", {
        method: "POST",
        body: formData,
      })

      const data = (await res.json()) as {
        ok: boolean
        status: "approved" | "pending_review" | "rejected"
        message: string
        error?: string
      }

      if (!res.ok || !data.ok) {
        setRejectionReason(data.error ?? "Upload failed. Please try again.")
        setPhase("rejected")
        return
      }

      await refetchProfile()

      if (data.status === "approved") {
        setPhase("success")
        setTimeout(() => {
          router.push(hasProItems ? "/checkout" : "/products")
        }, 2000)
      } else if (data.status === "rejected") {
        setRejectionReason(data.message)
        setPhase("rejected")
      } else {
        setPhase("pending")
        setTimeout(() => {
          router.push("/profile")
        }, 3000)
      }
    } catch {
      setRejectionReason("A network error occurred. Please try again.")
      setPhase("rejected")
    }
  }

  function handleRetry() {
    setPhase("idle")
    setFile(null)
    setStep("upload")
    setRejectionReason("")
  }

  return (
    <div className="bg-muted/40 min-h-[calc(100dvh-4rem)]">
      <header className="border-border bg-background sticky top-0 z-10 border-b">
        <div className="mx-auto flex max-w-4xl items-center justify-between gap-4 px-4 py-4 sm:px-6">
          <button
            type="button"
            onClick={() => router.push("/cart")}
            className="text-muted-foreground hover:text-foreground text-sm font-medium transition-colors"
          >
            Cancel
          </button>

          <VerifyStepIndicator activeIndex={stepIndex} />

          <div className="flex items-center gap-2">
            {step !== "info" && (
              <button
                type="button"
                onClick={back}
                className="border-border text-foreground hover:bg-muted hidden h-9 items-center rounded-md border px-4 text-sm font-medium transition-colors sm:inline-flex"
              >
                Back
              </button>
            )}
            {step === "summary" ? (
              <button
                type="button"
                onClick={() => void handleConfirm()}
                disabled={phase === "processing"}
                className="bg-foreground text-background inline-flex h-9 items-center gap-1.5 rounded-md px-4 text-sm font-semibold transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
              >
                Confirm
              </button>
            ) : (
              <button
                type="button"
                onClick={next}
                disabled={!canContinue}
                className="bg-foreground text-background inline-flex h-9 items-center rounded-md px-5 text-sm font-semibold transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-40"
              >
                Next
              </button>
            )}
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-4xl px-4 py-8 sm:px-6 sm:py-12">
        {step === "info" && (
          <InfoStep
            info={info}
            onChange={setInfo}
            licenseError={licenseError}
            licenseHelperText={licenseHelperText}
          />
        )}
        {step === "upload" && (
          <UploadStep
            file={file}
            onFile={setFile}
            onClear={() => setFile(null)}
          />
        )}
        {step === "summary" && <SummaryStep info={info} file={file} />}
      </main>

      {/* ── Overlay states ── */}
      {phase !== "idle" && (
        <div
          className="bg-background/80 fixed inset-0 z-[70] flex items-center justify-center p-4 backdrop-blur-sm"
          role="status"
          aria-live="polite"
        >
          <div className="border-border bg-background flex w-full max-w-sm flex-col items-center rounded-2xl border p-10 text-center shadow-2xl">
            {phase === "processing" && (
              <>
                <Loader2
                  className="text-foreground h-12 w-12 animate-spin"
                  strokeWidth={1.5}
                />
                <h2 className="text-foreground mt-6 text-lg font-semibold tracking-tight">
                  Analyzing your document
                </h2>
                <p className="text-muted-foreground mt-2 text-sm leading-relaxed">
                  Cross-checking your license with the cosmetology board.
                </p>
              </>
            )}

            {phase === "success" && (
              <>
                <span className="animate-in zoom-in-50 flex h-14 w-14 items-center justify-center rounded-full bg-emerald-600 text-white duration-300">
                  <Check className="h-7 w-7" strokeWidth={2.5} />
                </span>
                <h2 className="text-foreground mt-6 text-lg font-semibold tracking-tight">
                  License verified
                </h2>
                <p className="text-muted-foreground mt-2 text-sm leading-relaxed">
                  Professional pricing is unlocked. Redirecting…
                </p>
              </>
            )}

            {phase === "pending" && (
              <>
                <span className="animate-in zoom-in-50 flex h-14 w-14 items-center justify-center rounded-full bg-amber-500 text-white duration-300">
                  <Loader2 className="h-7 w-7" strokeWidth={2} />
                </span>
                <h2 className="text-foreground mt-6 text-lg font-semibold tracking-tight">
                  Under review
                </h2>
                <p className="text-muted-foreground mt-2 text-sm leading-relaxed">
                  We&apos;ll email you within 1 business day. Redirecting to
                  your profile…
                </p>
              </>
            )}

            {phase === "rejected" && (
              <>
                <span className="flex h-14 w-14 items-center justify-center rounded-full bg-rose-600 text-white">
                  <AlertCircle className="h-7 w-7" strokeWidth={2} />
                </span>
                <h2 className="text-foreground mt-6 text-lg font-semibold tracking-tight">
                  Verification unsuccessful
                </h2>
                <p className="text-muted-foreground mt-2 text-sm leading-relaxed">
                  {rejectionReason}
                </p>
                <button
                  type="button"
                  onClick={handleRetry}
                  className="bg-foreground text-background mt-6 inline-flex h-10 items-center gap-2 rounded-md px-5 text-sm font-semibold transition-opacity hover:opacity-90"
                >
                  <RefreshCw className="h-4 w-4" strokeWidth={2} />
                  Re-upload document
                </button>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
