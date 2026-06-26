"use client"

import { Upload, X } from "lucide-react"

import { Button } from "@/components/ui/button"

interface CasePhotoUploadProps {
  files: File[]
  max: number
  onSelect: (files: FileList) => void
  onRemove: (index: number) => void
}

/** Evidence photo grid with previews and an add-photo input (up to `max`). */
export function CasePhotoUpload({
  files,
  max,
  onSelect,
  onRemove,
}: CasePhotoUploadProps) {
  return (
    <div className="grid gap-4 sm:grid-cols-3">
      {files.map((file, i) => (
        <div
          key={i}
          className="border-border relative flex aspect-square items-center justify-center overflow-hidden rounded-md border"
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={URL.createObjectURL(file)}
            alt="Preview"
            className="h-full w-full object-cover"
          />
          <Button
            type="button"
            variant="ghost"
            size="icon-xs"
            onClick={() => onRemove(i)}
            className="bg-background/80 hover:bg-background absolute top-1 right-1 rounded-full"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
      ))}
      {files.length < max && (
        <label className="border-border text-muted-foreground hover:bg-muted/50 flex aspect-square cursor-pointer flex-col items-center justify-center gap-2 rounded-md border border-dashed transition-colors">
          <Upload className="h-5 w-5" />
          <span className="text-xs font-medium">Add Photo</span>
          <input
            type="file"
            accept="image/jpeg,image/png,image/webp"
            className="hidden"
            multiple
            onChange={(e) => e.target.files && onSelect(e.target.files)}
          />
        </label>
      )}
    </div>
  )
}
