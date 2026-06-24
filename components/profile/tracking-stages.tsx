import { Check, MapPin, Package, Truck, XCircle } from "lucide-react"
import type { DbOrder } from "@/lib/orders/types"
import { orderStatusToStageIndex } from "@/lib/orders/types"
import { cn } from "@/lib/utils"

const STAGES = [
  { id: "placed", label: "Order placed", icon: Check },
  { id: "processing", label: "Processing", icon: Package },
  { id: "shipped", label: "Shipped", icon: Truck },
  { id: "delivered", label: "Delivered", icon: MapPin },
]

export function TrackingStages({ order }: { order: DbOrder }) {
  const currentStage = orderStatusToStageIndex(order.status)
  const isCancelled =
    order.status === "cancelled" || order.status === "refunded"
  const isDelivered = order.status === "delivered"

  return (
    <section className="border-border bg-card mt-6 rounded-2xl border p-6">
      {isCancelled ? (
        <div className="flex items-center gap-3">
          <XCircle className="text-destructive h-5 w-5" strokeWidth={1.75} />
          <div>
            <p className="text-foreground text-sm font-semibold">
              {order.status === "cancelled"
                ? "Order cancelled"
                : "Order refunded"}
            </p>
            <p className="text-muted-foreground text-xs">
              Please contact support if you have questions.
            </p>
          </div>
        </div>
      ) : (
        <ol className="flex flex-col">
          {STAGES.map((stage, i) => {
            const done = i <= currentStage
            const isLast = i === STAGES.length - 1
            const Icon = stage.icon
            return (
              <li key={stage.id} className="flex gap-4">
                <div className="flex flex-col items-center">
                  <span
                    className={cn(
                      "flex h-9 w-9 items-center justify-center rounded-full",
                      done
                        ? "bg-foreground text-background"
                        : "border-border bg-background text-muted-foreground border",
                    )}
                  >
                    <Icon className="h-4 w-4" strokeWidth={2} />
                  </span>
                  {!isLast && (
                    <span
                      className={cn(
                        "my-1 w-px flex-1",
                        i < currentStage ? "bg-foreground" : "bg-border",
                      )}
                    />
                  )}
                </div>
                <div className={isLast ? "pt-1 pb-0" : "pt-1 pb-8"}>
                  <p
                    className={cn(
                      "text-sm",
                      done
                        ? "text-foreground font-semibold"
                        : "text-muted-foreground font-medium",
                    )}
                  >
                    {stage.label}
                  </p>
                  <p className="text-muted-foreground mt-0.5 text-xs">
                    {i === currentStage
                      ? isDelivered
                        ? "Completed"
                        : "In progress"
                      : done
                        ? "Completed"
                        : "Pending"}
                  </p>
                </div>
              </li>
            )
          })}
        </ol>
      )}
    </section>
  )
}
