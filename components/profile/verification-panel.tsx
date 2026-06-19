/* eslint-disable @next/next/no-img-element */
"use client"

import { useEffect, useRef, useState } from "react"
import {
  BadgeCheck,
  Clock,
  FileText,
  ShieldCheck,
  Upload,
  UploadCloud,
  X,
} from "lucide-react"
import type { VerificationStatus } from "@/lib/types"
import { cn } from "@/lib/utils"

export function VerificationPanel({
  status,
  email,
  onSubmit,
}: {
  status: VerificationStatus
  email: string
  onSubmit: () => void
}) {
  const [fileName, setFileName] = useState<string | null>(null)
  const [previewUrl, setPreviewUrl] = useState<string | null>(null)
  const inputRef = useRef<HTMLInputElement>(null)
  const locked = status !== "regular"

  useEffect(() => {
    return () => {
      if (previewUrl) URL.revokeObjectURL(previewUrl)
    }
  }, [previewUrl])

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const f = e.target.files?.[0]
    if (!f) return
    if (previewUrl) URL.revokeObjectURL(previewUrl)
    setFileName(f.name)
    setPreviewUrl(URL.createObjectURL(f))
  }

  function clearFile() {
    if (previewUrl) URL.revokeObjectURL(previewUrl)
    setFileName(null)
    setPreviewUrl(null)
    if (inputRef.current) inputRef.current.value = ""
  }

  return (
    <section className="border-border bg-card rounded-2xl border p-6">
      <div className="flex items-center gap-2">
        <ShieldCheck className="text-foreground h-4 w-4" strokeWidth={2} />
        <h3 className="text-foreground text-sm font-semibold">
          Professional Verification
        </h3>
      </div>

      {status === "verified" ? (
        <div className="border-foreground/15 bg-muted mt-4 flex items-center gap-3 rounded-xl border px-4 py-3">
          <BadgeCheck className="text-foreground h-5 w-5" strokeWidth={2} />
          <p className="text-foreground text-sm">
            Your license is verified. Professional pricing and B2B ordering are
            unlocked.
          </p>
        </div>
      ) : status === "pending" ? (
        <div className="border-border bg-muted mt-4 flex items-start gap-3 rounded-xl border px-4 py-3">
          <Clock
            className="text-foreground mt-0.5 h-5 w-5 shrink-0"
            strokeWidth={2}
          />
          <div>
            <p className="text-foreground text-sm font-medium">
              Review in progress
            </p>
            <p className="text-muted-foreground mt-0.5 text-sm">
              We&apos;re reviewing your documents. We&apos;ll email{" "}
              <span className="text-foreground font-medium">{email}</span> as
              soon as your professional status is approved.
            </p>
          </div>
        </div>
      ) : (
        <>
          <p className="text-muted-foreground mt-3 text-sm">
            Upload your cosmetology or salon license to unlock professional
            pricing and restricted products.
          </p>
          <button
            type="button"
            disabled={locked}
            onClick={() => inputRef.current?.click()}
            className={cn(
              "mt-4 flex w-full flex-col items-center justify-center rounded-xl border-2 border-dashed px-6 py-8 text-center transition-colors",
              locked
                ? "border-border cursor-not-allowed opacity-50"
                : "border-border hover:border-foreground/40",
            )}
          >
            {previewUrl?.startsWith("blob:") ? (
              <img
                src={previewUrl}
                alt="License preview"
                className="h-20 w-20 rounded-md object-cover"
              />
            ) : (
              <UploadCloud
                className="text-muted-foreground h-8 w-8"
                strokeWidth={1.5}
              />
            )}
            <span className="text-foreground mt-3 text-sm font-medium">
              {fileName ? fileName : "Click to upload license document"}
            </span>
            <span className="text-muted-foreground mt-1 text-xs">
              PDF, JPG or PNG · up to 10MB
            </span>
          </button>
          <input
            ref={inputRef}
            type="file"
            accept=".pdf,.jpg,.jpeg,.png"
            className="hidden"
            onChange={handleFileChange}
          />

          {fileName && (
            <div className="border-border bg-muted mt-3 flex items-center justify-between rounded-lg border px-3 py-2.5">
              <span className="text-foreground flex min-w-0 items-center gap-2 text-sm">
                <FileText
                  className="text-muted-foreground h-4 w-4 shrink-0"
                  strokeWidth={1.75}
                />
                <span className="truncate">{fileName}</span>
              </span>
              <button
                type="button"
                onClick={clearFile}
                aria-label="Remove file"
                className="text-muted-foreground hover:bg-background hover:text-foreground flex h-7 w-7 items-center justify-center rounded-md transition-colors"
              >
                <X className="h-4 w-4" strokeWidth={1.75} />
              </button>
            </div>
          )}

          <button
            type="button"
            disabled={!fileName}
            onClick={onSubmit}
            className="bg-foreground text-background mt-4 inline-flex h-11 w-full items-center justify-center gap-2 rounded-md text-sm font-semibold transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-40"
          >
            <Upload className="h-4 w-4" strokeWidth={2} />
            Submit for verification
          </button>
        </>
      )}
    </section>
  )
}
