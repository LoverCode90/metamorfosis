"use client"

import { useState } from "react"
import { Pencil } from "lucide-react"

export function EditableField({
  label,
  value,
  onSave,
  type = "text",
  multiline,
  readOnly = false,
}: {
  label: string
  value: string
  onSave?: (v: string) => void
  type?: string
  multiline?: boolean
  readOnly?: boolean
}) {
  const [editing, setEditing] = useState(false)
  const [draft, setDraft] = useState(value)

  function start() {
    setDraft(value)
    setEditing(true)
  }
  function save() {
    if (draft.trim()) onSave?.(draft.trim())
    setEditing(false)
  }

  return (
    <section className="border-border bg-card rounded-2xl border p-5">
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0 flex-1">
          <p className="text-muted-foreground text-xs font-medium tracking-wide uppercase">
            {label}
          </p>
          {!editing && (
            <p className="text-foreground mt-1.5 text-sm leading-relaxed text-pretty">
              {value || <span className="text-muted-foreground">Not set</span>}
            </p>
          )}
        </div>
        {!editing && !readOnly && (
          <button
            type="button"
            onClick={start}
            className="border-border text-foreground hover:bg-muted inline-flex items-center gap-1.5 rounded-md border px-3 py-1.5 text-xs font-medium transition-colors"
          >
            <Pencil className="h-3.5 w-3.5" strokeWidth={1.75} />
            Edit
          </button>
        )}
      </div>

      {editing && (
        <div className="mt-3 flex flex-col gap-3">
          {multiline ? (
            <textarea
              value={draft}
              onChange={(e) => setDraft(e.target.value)}
              rows={3}
              autoFocus
              className="border-border bg-background text-foreground focus:border-foreground w-full resize-none rounded-md border px-3 py-2 text-sm transition-colors outline-none"
            />
          ) : (
            <input
              type={type}
              value={draft}
              onChange={(e) => setDraft(e.target.value)}
              autoFocus
              className="border-border bg-background text-foreground focus:border-foreground h-11 w-full rounded-md border px-3 text-sm transition-colors outline-none"
            />
          )}
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={save}
              className="bg-foreground text-background inline-flex h-9 items-center rounded-md px-4 text-xs font-semibold transition-opacity hover:opacity-90"
            >
              Save changes
            </button>
            <button
              type="button"
              onClick={() => setEditing(false)}
              className="border-border text-foreground hover:bg-muted inline-flex h-9 items-center rounded-md border px-4 text-xs font-medium transition-colors"
            >
              Cancel
            </button>
          </div>
        </div>
      )}
    </section>
  )
}
