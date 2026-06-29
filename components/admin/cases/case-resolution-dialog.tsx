"use client"

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"

interface CaseResolutionDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  title: string
  description: string
  /** Whether the resolution message is required to confirm. */
  required: boolean
  confirmLabel: string
  confirmVariant?: "default" | "destructive"
  value: string
  onChange: (value: string) => void
  onConfirm: () => void
  loading: boolean
  error?: string
}

/** Shared dialog for approving/rejecting a case with a resolution message. */
export function CaseResolutionDialog({
  open,
  onOpenChange,
  title,
  description,
  required,
  confirmLabel,
  confirmVariant = "default",
  value,
  onChange,
  onConfirm,
  loading,
  error,
}: CaseResolutionDialogProps) {
  const canConfirm = !loading && (!required || value.trim().length > 0)

  return (
    <Dialog open={open} onOpenChange={(next) => !loading && onOpenChange(next)}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription>{description}</DialogDescription>
        </DialogHeader>

        <div className="space-y-2 py-2">
          <Label htmlFor="resolution">
            Resolution message{required ? " (required)" : " (optional)"}
          </Label>
          <Textarea
            id="resolution"
            value={value}
            onChange={(event) => onChange(event.target.value)}
            placeholder="This message will be included in the email to the customer..."
            disabled={loading}
          />
          {error && (
            <p className="text-destructive text-sm font-medium">{error}</p>
          )}
        </div>

        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={loading}
          >
            Cancel
          </Button>
          <Button
            variant={confirmVariant}
            onClick={onConfirm}
            disabled={!canConfirm}
          >
            {loading ? "Saving..." : confirmLabel}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
