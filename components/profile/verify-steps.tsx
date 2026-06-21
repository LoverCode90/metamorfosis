"use client"

import { useRef, useState } from "react"
import {
  Check,
  ChevronDown,
  FileText,
  HelpCircle,
  ShieldCheck,
  UploadCloud,
  X,
} from "lucide-react"
import { cn } from "@/lib/utils"

export interface LicenseInfo {
  businessName: string
  licenseNumber: string
  country: string
  profession: string
}

export interface UploadedFile {
  name: string
  size: string
  /** The actual File object — sent to the upload API as FormData. */
  file: File
}

export function InfoStep({
  info,
  onChange,
  licenseError,
  licenseHelperText,
}: {
  info: LicenseInfo
  onChange: (info: LicenseInfo) => void
  licenseError?: string | null
  licenseHelperText?: string
}) {
  return (
    <div className="mx-auto max-w-2xl">
      <div className="mb-8 text-center">
        <h1 className="text-foreground text-xl font-semibold tracking-tight">
          Verify your professional license
        </h1>
        <p className="text-muted-foreground mt-2 text-sm">
          Professional-only formulas require a valid cosmetology or barbering
          license.
        </p>
      </div>
      <div className="border-border bg-background space-y-5 rounded-xl border p-6">
        <InfoField label="Business / Salon name">
          <input
            type="text"
            value={info.businessName}
            onChange={(e) =>
              onChange({ ...info, businessName: e.target.value })
            }
            placeholder="Metamorfosis Studio"
            className="border-border bg-background text-foreground placeholder:text-muted-foreground focus:border-foreground h-11 w-full rounded-md border px-3 text-sm transition-colors outline-none"
          />
        </InfoField>
        <InfoField label="Profession" required>
          <select
            value={info.profession}
            onChange={(e) => onChange({ ...info, profession: e.target.value })}
            className="border-border bg-background text-foreground focus:border-foreground h-11 w-full rounded-md border px-3 text-sm transition-colors outline-none"
          >
            <option>Cosmetologist</option>
            <option>Barber</option>
            <option>Colorist</option>
            <option>Salon Owner</option>
            <option>Esthetician</option>
          </select>
        </InfoField>
        <InfoField label="License number" required>
          <input
            type="text"
            value={info.licenseNumber}
            onChange={(e) =>
              onChange({ ...info, licenseNumber: e.target.value })
            }
            placeholder="e.g. C123456"
            className={cn(
              "border-border bg-background text-foreground placeholder:text-muted-foreground focus:border-foreground h-11 w-full rounded-md border px-3 text-sm transition-colors outline-none",
              licenseError && "border-rose-500 focus:border-rose-500",
            )}
          />
          {licenseHelperText && !licenseError && (
            <p className="text-muted-foreground mt-1 text-xs">
              {licenseHelperText}
            </p>
          )}
          {licenseError && (
            <p className="mt-1 text-xs text-rose-500">{licenseError}</p>
          )}
        </InfoField>
        <InfoField label="Country / Region">
          <select
            value={info.country}
            onChange={(e) => onChange({ ...info, country: e.target.value })}
            className="border-border bg-background text-foreground focus:border-foreground h-11 w-full rounded-md border px-3 text-sm transition-colors outline-none"
          >
            <option value="United States">United States</option>
          </select>
        </InfoField>
      </div>
    </div>
  )
}

function InfoField({
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
      <span className="text-foreground mb-1.5 block text-sm font-medium">
        {label}
        {required && <span className="text-muted-foreground ml-0.5">*</span>}
      </span>
      {children}
    </label>
  )
}

export function UploadStep({
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

  function accept(f: File) {
    const kb = f.size / 1024
    onFile({
      name: f.name,
      size:
        kb > 1024
          ? `${(kb / 1024).toFixed(1)} MB`
          : `${Math.max(1, Math.round(kb))} KB`,
      file: f,
    })
  }

  return (
    <div className="mx-auto max-w-2xl">
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
          "bg-background flex w-full flex-col items-center justify-center rounded-2xl border-2 border-dashed px-6 py-14 text-center transition-colors",
          dragging
            ? "border-foreground bg-muted/60"
            : "border-border hover:border-foreground/40",
        )}
      >
        <span className="relative mb-5 flex h-14 w-14 items-center justify-center">
          <FileText
            className="text-muted-foreground h-9 w-9"
            strokeWidth={1.5}
          />
          <span className="bg-foreground absolute -right-1 -bottom-1 flex h-6 w-6 items-center justify-center rounded-full">
            <UploadCloud
              className="text-background h-3.5 w-3.5"
              strokeWidth={2}
            />
          </span>
        </span>
        <span className="text-foreground text-base font-semibold">
          Upload your license document
        </span>
        <span className="text-muted-foreground mt-1 text-xs">
          Maximum file size: 10 MB
        </span>
        <span className="text-muted-foreground text-xs">
          Supported formats: PDF, JPG, PNG, WebP
        </span>
        <input
          ref={inputRef}
          type="file"
          accept=".pdf,.jpg,.jpeg,.png,.webp"
          className="hidden"
          onChange={(e) => {
            const f = e.target.files?.[0]
            if (f) accept(f)
          }}
        />
      </button>

      {file && (
        <div className="border-border bg-background mt-5 flex items-center gap-3 rounded-xl border p-4">
          <span className="bg-muted flex h-10 w-10 shrink-0 items-center justify-center rounded-md">
            <FileText className="text-foreground h-5 w-5" strokeWidth={1.75} />
          </span>
          <div className="min-w-0 flex-1">
            <p className="text-foreground truncate text-sm font-medium">
              {file.name}
            </p>
            <p className="text-muted-foreground text-xs">
              {file.size} · Uploaded
            </p>
            <div className="bg-muted mt-2 h-1.5 w-full overflow-hidden rounded-full">
              <span className="bg-foreground block h-full w-full rounded-full" />
            </div>
          </div>
          <button
            type="button"
            onClick={onClear}
            aria-label="Remove file"
            className="border-border text-muted-foreground hover:bg-muted hover:text-foreground flex h-8 w-8 shrink-0 items-center justify-center rounded-full border transition-colors"
          >
            <X className="h-4 w-4" strokeWidth={2} />
          </button>
        </div>
      )}

      <div className="border-border bg-background mt-4 overflow-hidden rounded-xl border">
        <button
          type="button"
          onClick={() => setHelpOpen((o) => !o)}
          className="flex w-full items-center justify-between gap-3 px-4 py-4 text-left"
          aria-expanded={helpOpen}
        >
          <span className="text-foreground flex items-center gap-2.5 text-sm font-medium">
            <HelpCircle
              className="text-foreground h-5 w-5"
              strokeWidth={1.75}
            />
            How do we verify your license?
          </span>
          <ChevronDown
            className={cn(
              "text-muted-foreground h-4 w-4 shrink-0 transition-transform",
              helpOpen && "rotate-180",
            )}
            strokeWidth={2}
          />
        </button>
        {helpOpen && (
          <div className="border-border text-muted-foreground border-t px-4 py-4 text-sm leading-relaxed">
            We cross-check your license number against your state or national
            cosmetology board. Most submissions are approved instantly; manual
            reviews complete within one business day.
          </div>
        )}
      </div>
    </div>
  )
}

export function SummaryStep({
  info,
  file,
}: {
  info: LicenseInfo
  file: UploadedFile | null
}) {
  return (
    <div className="mx-auto max-w-2xl">
      <div className="mb-8 flex flex-col items-center text-center">
        <span className="bg-foreground text-background mb-4 flex h-14 w-14 items-center justify-center rounded-full">
          <ShieldCheck className="h-7 w-7" strokeWidth={1.75} />
        </span>
        <h1 className="text-foreground text-xl font-semibold tracking-tight">
          Review and confirm
        </h1>
        <p className="text-muted-foreground mt-2 text-sm">
          Confirm the details below to unlock professional products and continue
          to checkout.
        </p>
      </div>
      <dl className="divide-border border-border bg-background divide-y rounded-xl border">
        {[
          { label: "Business / Salon", value: info.businessName || "—" },
          { label: "License number", value: info.licenseNumber || "—" },
          { label: "Profession", value: info.profession },
          { label: "Country / Region", value: info.country },
          { label: "Document", value: file?.name ?? "Not attached" },
        ].map(({ label, value }) => (
          <div
            key={label}
            className="flex items-center justify-between gap-4 px-5 py-4"
          >
            <dt className="text-muted-foreground text-sm">{label}</dt>
            <dd className="text-foreground truncate text-right text-sm font-medium">
              {value}
            </dd>
          </div>
        ))}
      </dl>
      <p className="text-muted-foreground mt-5 text-center text-xs">
        By confirming, you certify that the information provided is accurate and
        that you hold a valid professional license.
      </p>
    </div>
  )
}

export function VerifyStepIndicator({ activeIndex }: { activeIndex: number }) {
  const STEPS = [
    { id: "info", label: "Information" },
    { id: "upload", label: "Upload license" },
    { id: "summary", label: "Summary" },
  ]
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
                done || active
                  ? "bg-foreground text-background"
                  : "border-border text-muted-foreground border",
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
              <span className="bg-border hidden h-px w-6 sm:inline-block" />
            )}
          </li>
        )
      })}
    </ol>
  )
}
