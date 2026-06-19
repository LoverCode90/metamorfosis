"use client"

import { useEffect, useState } from "react"
import { Check, Loader2 } from "lucide-react"
import { useRouter } from "next/navigation"
import { useUser } from "@/hooks/use-user"
import { useCartStore } from "@/stores/cart"
import {
  InfoStep,
  UploadStep,
  SummaryStep,
  VerifyStepIndicator,
  type LicenseInfo,
  type UploadedFile,
} from "./verify-steps"

type WizardStep = "info" | "upload" | "summary"

const STEP_ORDER: WizardStep[] = ["info", "upload", "summary"]

export function VerifyPage() {
  const router = useRouter()
  const { approveVerification } = useUser()
  const hasProItems = useCartStore((s) => s.hasProItems)

  const [step, setStep] = useState<WizardStep>("info")
  const [info, setInfo] = useState<LicenseInfo>({
    businessName: "",
    licenseNumber: "",
    country: "United States",
    profession: "Cosmetologist",
  })
  const [file, setFile] = useState<UploadedFile | null>(null)
  const [phase, setPhase] = useState<"idle" | "processing" | "success">("idle")

  const stepIndex = STEP_ORDER.indexOf(step)
  const canContinue =
    step === "info"
      ? info.businessName.trim() !== "" && info.licenseNumber.trim() !== ""
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

  useEffect(() => {
    if (phase === "processing") {
      const id = setTimeout(() => setPhase("success"), 2200)
      return () => clearTimeout(id)
    }
    if (phase === "success") {
      const id = setTimeout(() => {
        approveVerification()
        router.push(hasProItems ? "/checkout" : "/cart")
      }, 1600)
      return () => clearTimeout(id)
    }
  }, [phase, approveVerification, router, hasProItems])

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
                onClick={() => setPhase("processing")}
                className="bg-foreground text-background inline-flex h-9 items-center gap-1.5 rounded-md px-4 text-sm font-semibold transition-opacity hover:opacity-90"
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
        {step === "info" && <InfoStep info={info} onChange={setInfo} />}
        {step === "upload" && (
          <UploadStep
            file={file}
            onFile={setFile}
            onClear={() => setFile(null)}
          />
        )}
        {step === "summary" && <SummaryStep info={info} file={file} />}
      </main>

      {phase !== "idle" && (
        <div
          className="bg-background/80 fixed inset-0 z-[70] flex items-center justify-center p-4 backdrop-blur-sm"
          role="status"
          aria-live="polite"
        >
          <div className="border-border bg-background flex w-full max-w-sm flex-col items-center rounded-2xl border p-10 text-center shadow-2xl">
            {phase === "processing" ? (
              <>
                <Loader2
                  className="text-foreground h-12 w-12 animate-spin"
                  strokeWidth={1.5}
                />
                <h2 className="text-foreground mt-6 text-lg font-semibold tracking-tight">
                  Verifying your documents
                </h2>
                <p className="text-muted-foreground mt-2 text-sm leading-relaxed">
                  Cross-checking your license with the cosmetology board.
                </p>
              </>
            ) : (
              <>
                <span className="animate-in zoom-in-50 flex h-14 w-14 items-center justify-center rounded-full bg-emerald-600 text-white duration-300">
                  <Check className="h-7 w-7" strokeWidth={2.5} />
                </span>
                <h2 className="text-foreground mt-6 text-lg font-semibold tracking-tight">
                  Document approved
                </h2>
                <p className="text-muted-foreground mt-2 text-sm leading-relaxed">
                  Your professional status is verified. Redirecting…
                </p>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
