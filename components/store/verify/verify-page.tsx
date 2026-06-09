"use client"

import { useState, useRef, useCallback } from "react"
import {
  Check,
  ChevronLeft,
  FileText,
  UploadCloud,
  Download,
  X,
  HelpCircle,
  ChevronDown,
  ShieldCheck,
} from "lucide-react"
import { useCart } from "../cart-context"
import { cn } from "@/lib/utils"

type WizardStep = "info" | "upload" | "summary"

const STEPS: { id: WizardStep; label: string }[] = [
  { id: "info", label: "Information" },
  { id: "upload", label: "Upload license" },
  { id: "summary", label: "Summary" },
]

interface LicenseInfo {
  businessName: string
  licenseNumber: string
  country: string
  profession: string
}

interface UploadedFile {
  name: string
  size: string
}

export function VerifyPage() {
  const { setView, setVerified, hasProItems } = useCart()
  const [step, setStep] = useState<WizardStep>("info")
  const [info, setInfo] = useState<LicenseInfo>({
    businessName: "",
    licenseNumber: "",
    country: "United States",
    profession: "Cosmetologist",
  })
  const [file, setFile] = useState<UploadedFile | null>(null)

  const stepIndex = STEPS.findIndex((s) => s.id === step)

  function next() {
    if (step === "info") setStep("upload")
    else if (step === "upload") setStep("summary")
  }
  function back() {
    if (step === "summary") setStep("upload")
    else if (step === "upload") setStep("info")
  }

  function complete() {
    setVerified(true)
    // After verification, send the colorist straight into checkout if items
    // remain, otherwise back to the cart.
    setView(hasProItems ? "checkout" : "cart")
  }

  const canContinue =
    step === "info"
      ? info.businessName.trim() !== "" && info.licenseNumber.trim() !== ""
      : step === "upload"
        ? file !== null
        : true

  return (
    <div className="min-h-[calc(100dvh-4rem)] bg-muted/40">
      {/* Wizard top bar */}
      <header className="sticky top-0 z-10 border-b border-border bg-background">
        <div className="mx-auto flex max-w-4xl items-center justify-between gap-4 px-4 py-4 sm:px-6">
          <button
            type="button"
            onClick={() => setView("cart")}
            className="text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
          >
            Cancel
          </button>

          <StepIndicator activeIndex={stepIndex} />

          <div className="flex items-center gap-2">
            {step !== "info" && (
              <button
                type="button"
                onClick={back}
                className="hidden h-9 items-center rounded-md border border-border px-4 text-sm font-medium text-foreground transition-colors hover:bg-muted sm:inline-flex"
              >
                Back
              </button>
            )}
            {step === "summary" ? (
              <button
                type="button"
                onClick={complete}
                className="inline-flex h-9 items-center gap-1.5 rounded-md bg-foreground px-4 text-sm font-semibold text-background transition-opacity hover:opacity-90"
              >
                Confirm
              </button>
            ) : (
              <button
                type="button"
                onClick={next}
                disabled={!canContinue}
                className="inline-flex h-9 items-center rounded-md bg-foreground px-5 text-sm font-semibold text-background transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-40"
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
          <UploadStep file={file} onFile={setFile} onClear={() => setFile(null)} />
        )}
        {step === "summary" && <SummaryStep info={info} file={file} />}
      </main>
    </div>
  )
}

// ---------------------------------------------------------------------------
// Step indicator
// ---------------------------------------------------------------------------
function StepIndicator({ activeIndex }: { activeIndex: number }) {
  return (
    <ol className="flex items-center gap-2 sm:gap-3">
      {STEPS.map((s, i) => {
        const done = i < activeIndex
        const active = i === activeIndex
        return (
          <li key={s.id} className="flex items-center gap-2 sm:gap-3">
            <span
              className={cn(
                "flex h-6 w-6 shrink-0 items-center justify-center rounded-md text-xs font-semibold transition-colors",
                done && "bg-foreground text-background",
                active && "bg-foreground text-background",
                !done && !active && "border border-border text-muted-foreground",
              )}
            >
              {done ? <Check className="h-3.5 w-3.5" strokeWidth={3} /> : i + 1}
            </span>
            <span
              className={cn(
                "hidden text-sm font-medium sm:inline",
                active || done ? "text-foreground" : "text-muted-foreground",
              )}
            >
              {s.label}
            </span>
            {i < STEPS.length - 1 && (
              <span className="hidden h-px w-6 bg-border sm:inline-block" />
            )}
          </li>
        )
      })}
    </ol>
  )
}

// ---------------------------------------------------------------------------
// Step 1 — Information
// ---------------------------------------------------------------------------
function InfoStep({
  info,
  onChange,
}: {
  info: LicenseInfo
  onChange: (info: LicenseInfo) => void
}) {
  return (
    <div className="mx-auto max-w-2xl">
      <div className="mb-8 text-center">
        <h1 className="text-xl font-semibold tracking-tight text-foreground">
          Verify your professional license
        </h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Professional-only formulas require a valid cosmetology or barbering license.
          Your details are reviewed once and stored securely.
        </p>
      </div>

      <div className="space-y-5 rounded-xl border border-border bg-background p-6">
        <Field label="Business / Salon name" required>
          <input
            type="text"
            value={info.businessName}
            onChange={(e) => onChange({ ...info, businessName: e.target.value })}
            placeholder="Metamorfosis Studio"
            className="h-11 w-full rounded-md border border-border bg-background px-3 text-sm text-foreground outline-none transition-colors placeholder:text-muted-foreground focus:border-foreground"
          />
        </Field>

        <Field label="License number" required>
          <input
            type="text"
            value={info.licenseNumber}
            onChange={(e) => onChange({ ...info, licenseNumber: e.target.value })}
            placeholder="e.g. CL-0192834"
            className="h-11 w-full rounded-md border border-border bg-background px-3 text-sm text-foreground outline-none transition-colors placeholder:text-muted-foreground focus:border-foreground"
          />
        </Field>

        <div className="grid gap-5 sm:grid-cols-2">
          <Field label="Profession">
            <select
              value={info.profession}
              onChange={(e) => onChange({ ...info, profession: e.target.value })}
              className="h-11 w-full rounded-md border border-border bg-background px-3 text-sm text-foreground outline-none transition-colors focus:border-foreground"
            >
              <option>Cosmetologist</option>
              <option>Barber</option>
              <option>Colorist</option>
              <option>Salon Owner</option>
              <option>Esthetician</option>
            </select>
          </Field>

          <Field label="Country / Region">
            <select
              value={info.country}
              onChange={(e) => onChange({ ...info, country: e.target.value })}
              className="h-11 w-full rounded-md border border-border bg-background px-3 text-sm text-foreground outline-none transition-colors focus:border-foreground"
            >
              <option>United States</option>
              <option>Canada</option>
              <option>United Kingdom</option>
              <option>Australia</option>
              <option>Germany</option>
            </select>
          </Field>
        </div>
      </div>
    </div>
  )
}

function Field({
  label,
  required,
  children,
}: {
  label: string
  required?: boolean
  children: React.ReactNode
}) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-sm font-medium text-foreground">
        {label}
        {required && <span className="ml-0.5 text-muted-foreground">*</span>}
      </span>
      {children}
    </label>
  )
}

// ---------------------------------------------------------------------------
// Step 2 — Upload
// ---------------------------------------------------------------------------
function UploadStep({
  file,
  onFile,
  onClear,
}: {
  file: UploadedFile | null
  onFile: (f: UploadedFile) => void
  onClear: () => void
}) {
  const [dragging, setDragging] = useState(false)
  const [helpOpen, setHelpOpen] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)

  const accept = useCallback(
    (f: File) => {
      const kb = f.size / 1024
      onFile({
        name: f.name,
        size: kb > 1024 ? `${(kb / 1024).toFixed(1)} MB` : `${Math.max(1, Math.round(kb))} KB`,
      })
    },
    [onFile],
  )

  return (
    <div className="mx-auto max-w-2xl">
      {/* Drop zone */}
      <button
        type="button"
        onClick={() => inputRef.current?.click()}
        onDragOver={(e) => {
          e.preventDefault()
          setDragging(true)
        }}
        onDragLeave={() => setDragging(false)}
        onDrop={(e) => {
          e.preventDefault()
          setDragging(false)
          const f = e.dataTransfer.files?.[0]
          if (f) accept(f)
        }}
        className={cn(
          "flex w-full flex-col items-center justify-center rounded-2xl border-2 border-dashed bg-background px-6 py-14 text-center transition-colors",
          dragging ? "border-foreground bg-muted/60" : "border-border hover:border-foreground/40",
        )}
      >
        <span className="relative mb-5 flex h-14 w-14 items-center justify-center">
          <FileText className="h-9 w-9 text-muted-foreground" strokeWidth={1.5} />
          <span className="absolute -bottom-1 -right-1 flex h-6 w-6 items-center justify-center rounded-full bg-foreground">
            <UploadCloud className="h-3.5 w-3.5 text-background" strokeWidth={2} />
          </span>
        </span>
        <span className="text-base font-semibold text-foreground">
          Upload your license document
        </span>
        <span className="mt-1 text-xs text-muted-foreground">Maximum file size: 50 MB</span>
        <span className="text-xs text-muted-foreground">
          Supported formats: PDF, JPG, PNG
        </span>
        <input
          ref={inputRef}
          type="file"
          accept=".pdf,.jpg,.jpeg,.png"
          className="hidden"
          onChange={(e) => {
            const f = e.target.files?.[0]
            if (f) accept(f)
          }}
        />
      </button>

      {/* Uploaded file row */}
      {file && (
        <div className="mt-5 flex items-center gap-3 rounded-xl border border-border bg-background p-4">
          <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-md bg-muted">
            <FileText className="h-5 w-5 text-foreground" strokeWidth={1.75} />
          </span>
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-medium text-foreground">{file.name}</p>
            <p className="text-xs text-muted-foreground">{file.size} · Uploaded</p>
            <div className="mt-2 h-1.5 w-full overflow-hidden rounded-full bg-muted">
              <span className="block h-full w-full rounded-full bg-foreground" />
            </div>
          </div>
          <button
            type="button"
            onClick={onClear}
            aria-label="Remove file"
            className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-border text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
          >
            <X className="h-4 w-4" strokeWidth={2} />
          </button>
        </div>
      )}

      {/* Template download */}
      <p className="mb-2 mt-8 text-sm font-semibold text-foreground">
        Need a reference form?
      </p>
      <div className="flex items-center gap-3 rounded-xl border border-border bg-muted/40 p-4">
        <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-md bg-background ring-1 ring-border">
          <FileText className="h-5 w-5 text-foreground" strokeWidth={1.75} />
        </span>
        <div className="min-w-0 flex-1">
          <p className="text-sm font-medium text-foreground">License Authorization Template</p>
          <p className="text-xs text-muted-foreground">PDF · 84 KB</p>
        </div>
        <a
          href="data:application/pdf;base64,JVBERi0xLjQKJeLjz9MKMSAwIG9iago8PC9UeXBlL0NhdGFsb2cvUGFnZXMgMiAwIFI+PgplbmRvYmoKMiAwIG9iago8PC9UeXBlL1BhZ2VzL0tpZHNbMyAwIFJdL0NvdW50IDE+PgplbmRvYmoKMyAwIG9iago8PC9UeXBlL1BhZ2UvUGFyZW50IDIgMCBSL01lZGlhQm94WzAgMCAyMDAgMjAwXT4+CmVuZG9iagp4cmVmCjAgNAowMDAwMDAwMDAwIDY1NTM1IGYgCjAwMDAwMDAwMDkgMDAwMDAgbiAKMDAwMDAwMDA1NCAwMDAwMCBuIAowMDAwMDAwMTAxIDAwMDAwIG4gCnRyYWlsZXIKPDwvU2l6ZSA0L1Jvb3QgMSAwIFI+PgpzdGFydHhyZWYKMTc4CiUlRU9G"
          download="license-template.pdf"
          className="inline-flex h-9 shrink-0 items-center gap-1.5 rounded-md border border-border bg-background px-4 text-sm font-medium text-foreground transition-colors hover:bg-muted"
        >
          <Download className="h-4 w-4" strokeWidth={1.75} />
          Download
        </a>
      </div>

      {/* Help accordion */}
      <div className="mt-4 overflow-hidden rounded-xl border border-border bg-background">
        <button
          type="button"
          onClick={() => setHelpOpen((o) => !o)}
          className="flex w-full items-center justify-between gap-3 px-4 py-4 text-left"
          aria-expanded={helpOpen}
        >
          <span className="flex items-center gap-2.5 text-sm font-medium text-foreground">
            <HelpCircle className="h-5 w-5 text-foreground" strokeWidth={1.75} />
            How do we verify your license?
          </span>
          <ChevronDown
            className={cn(
              "h-4 w-4 shrink-0 text-muted-foreground transition-transform",
              helpOpen && "rotate-180",
            )}
            strokeWidth={2}
          />
        </button>
        {helpOpen && (
          <div className="border-t border-border px-4 py-4 text-sm leading-relaxed text-muted-foreground">
            We cross-check your license number against your state or national cosmetology
            board. Most submissions are approved instantly; manual reviews complete within
            one business day. You only need to verify once per account.
          </div>
        )}
      </div>
    </div>
  )
}

// ---------------------------------------------------------------------------
// Step 3 — Summary
// ---------------------------------------------------------------------------
function SummaryStep({
  info,
  file,
}: {
  info: LicenseInfo
  file: UploadedFile | null
}) {
  return (
    <div className="mx-auto max-w-2xl">
      <div className="mb-8 flex flex-col items-center text-center">
        <span className="mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-foreground text-background">
          <ShieldCheck className="h-7 w-7" strokeWidth={1.75} />
        </span>
        <h1 className="text-xl font-semibold tracking-tight text-foreground">
          Review and confirm
        </h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Confirm the details below to unlock professional products and continue to checkout.
        </p>
      </div>

      <dl className="divide-y divide-border rounded-xl border border-border bg-background">
        <SummaryRow label="Business / Salon" value={info.businessName || "—"} />
        <SummaryRow label="License number" value={info.licenseNumber || "—"} />
        <SummaryRow label="Profession" value={info.profession} />
        <SummaryRow label="Country / Region" value={info.country} />
        <SummaryRow label="Document" value={file?.name ?? "Not attached"} />
      </dl>

      <p className="mt-5 text-center text-xs text-muted-foreground">
        By confirming, you certify that the information provided is accurate and that you hold a
        valid professional license.
      </p>
    </div>
  )
}

function SummaryRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between gap-4 px-5 py-4">
      <dt className="text-sm text-muted-foreground">{label}</dt>
      <dd className="truncate text-right text-sm font-medium text-foreground">{value}</dd>
    </div>
  )
}
