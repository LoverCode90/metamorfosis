"use client"

import { useRef, useState } from "react"
import { ChevronDown, FileText, HelpCircle, UploadCloud, X } from "lucide-react"
import { cn } from "@/lib/utils"
import type { UploadedFile } from "./verify-step-types"

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
