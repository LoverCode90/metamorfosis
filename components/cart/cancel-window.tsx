"use client"

import { useEffect, useState } from "react"
import { Clock, ShieldCheck, X, AlertTriangle } from "lucide-react"
import { CANCEL_WINDOW_MINUTES } from "@/lib/types"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"

interface CancelWindowProps {
  placedAt: number
  canceled: boolean
  onCancel: () => void
}

function format(ms: number) {
  const total = Math.max(0, Math.floor(ms / 1000))
  const h = Math.floor(total / 3600)
  const m = Math.floor((total % 3600) / 60)
  const s = total % 60
  const pad = (n: number) => n.toString().padStart(2, "0")
  return `${pad(h)}:${pad(m)}:${pad(s)}`
}

export function CancelWindow({
  placedAt,
  canceled,
  onCancel,
}: CancelWindowProps) {
  const deadline = placedAt + CANCEL_WINDOW_MINUTES * 60 * 1000
  const [remaining, setRemaining] = useState(() => deadline - Date.now())
  const [confirmOpen, setConfirmOpen] = useState(false)

  useEffect(() => {
    const id = setInterval(() => setRemaining(deadline - Date.now()), 1000)
    return () => clearInterval(id)
  }, [deadline])

  function confirmCancel() {
    setConfirmOpen(false)
    onCancel()
  }

  if (canceled) {
    return (
      <div className="flex items-start gap-3 rounded-xl border border-emerald-600/30 bg-emerald-600/5 p-4">
        <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-emerald-600 text-white">
          <ShieldCheck className="h-5 w-5" strokeWidth={2} />
        </span>
        <div>
          <p className="text-foreground text-sm font-semibold">
            Pedido cancelado
          </p>
          <p className="text-muted-foreground mt-0.5 text-sm">
            Se ha emitido un reembolso completo de forma automática. Los fondos
            regresan a tu método de pago original en un plazo de 3 a 5 días
            hábiles.
          </p>
        </div>
      </div>
    )
  }

  const expired = remaining <= 0

  return (
    <div className="border-border bg-card rounded-xl border p-4">
      <div className="flex items-start gap-3">
        <span className="bg-muted text-foreground flex h-9 w-9 shrink-0 items-center justify-center rounded-full">
          <Clock className="h-5 w-5" strokeWidth={2} />
        </span>
        <div className="flex-1">
          <p className="text-foreground text-sm font-semibold">
            {expired
              ? "Ventana de cancelación cerrada"
              : "¿Cambiaste de opinión?"}
          </p>
          <p className="text-muted-foreground mt-0.5 text-sm">
            {expired
              ? "Tu pedido ya está siendo preparado para su envío."
              : "Cancela dentro del plazo para obtener un reembolso completo e inmediato, sin preguntas."}
          </p>

          {!expired && (
            <div className="mt-3 flex flex-wrap items-center gap-3">
              <span className="bg-foreground text-background inline-flex items-center gap-1.5 rounded-md px-2.5 py-1 font-mono text-sm font-semibold tabular-nums">
                {format(remaining)}
              </span>
              <button
                type="button"
                onClick={() => setConfirmOpen(true)}
                className="border-destructive/40 text-destructive hover:bg-destructive/10 inline-flex items-center gap-1.5 rounded-md border px-3 py-1.5 text-sm font-medium transition-colors"
              >
                <X className="h-4 w-4" strokeWidth={2} />
                Cancelar pedido
              </button>
            </div>
          )}
        </div>
      </div>

      <Dialog open={confirmOpen} onOpenChange={setConfirmOpen}>
        <DialogContent>
          <DialogHeader>
            <span className="bg-destructive/10 text-destructive flex h-11 w-11 items-center justify-center rounded-full">
              <AlertTriangle className="h-5 w-5" strokeWidth={2} />
            </span>
            <DialogTitle>¿Estás seguro de cancelar tu orden?</DialogTitle>
            <DialogDescription>
              Esto cancela tu pedido de inmediato y emite un reembolso completo
              de forma automática. Esta acción no se puede deshacer.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setConfirmOpen(false)}>
              Mantener mi pedido
            </Button>
            <Button variant="destructive" onClick={confirmCancel}>
              Sí, cancelar pedido
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
