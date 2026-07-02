import "server-only"

import type { InventoryState } from "square"
import { createSquareClient } from "./client"

export class SquareInventoryInsufficientError extends Error {
  constructor(message = "Insufficient stock in Square") {
    super(message)
    this.name = "SquareInventoryInsufficientError"
  }
}

export interface SquareInventoryLine {
  squareVariationId: string
  quantity: number
}

function isInsufficientStockError(err: unknown): boolean {
  if (!(err instanceof Error)) return false
  const msg = err.message.toLowerCase()
  return (
    msg.includes("insufficient") ||
    msg.includes("not enough") ||
    msg.includes("inventory")
  )
}

/**
 * Apply signed quantity adjustments in Square (negative = sale/decrement,
 * positive = restore/increment). One batch per call.
 */
export async function adjustSquareInventory(
  items: SquareInventoryLine[],
  idempotencyKey: string,
): Promise<void> {
  const locationId =
    process.env.SQUARE_LOCATION_ID || process.env.NEXT_PUBLIC_SQUARE_LOCATION_ID
  if (!locationId) {
    throw new Error("SQUARE_LOCATION_ID is not configured")
  }

  const changes = items
    .filter((item) => item.quantity !== 0)
    .map((item) => {
      const isDecrement = item.quantity < 0
      const fromState: InventoryState = isDecrement ? "IN_STOCK" : "NONE"
      const toState: InventoryState = isDecrement ? "SOLD" : "IN_STOCK"
      // Decrement: IN_STOCK → SOLD. Restore: NONE → IN_STOCK (Square rejects SOLD → IN_STOCK).
      return {
        type: "ADJUSTMENT" as const,
        adjustment: {
          catalogObjectId: item.squareVariationId,
          locationId,
          quantity: String(Math.abs(item.quantity)),
          fromState,
          toState,
          occurredAt: new Date().toISOString(),
        },
      }
    })

  if (changes.length === 0) return

  const square = createSquareClient()

  try {
    await square.inventory.batchCreateChanges({
      idempotencyKey,
      changes,
    })
  } catch (err) {
    if (isInsufficientStockError(err)) {
      throw new SquareInventoryInsufficientError()
    }
    throw err
  }
}

/** Post-checkout sale: decrement Square stock for each line item. */
export async function decrementSquareInventory(
  items: SquareInventoryLine[],
  idempotencyKey: string,
): Promise<void> {
  await adjustSquareInventory(
    items.map((item) => ({
      squareVariationId: item.squareVariationId,
      quantity: -Math.abs(item.quantity),
    })),
    idempotencyKey,
  )
}

/** Cancel/refund restore: increment Square stock for each line item. */
export async function incrementSquareInventory(
  items: SquareInventoryLine[],
  idempotencyKey: string,
): Promise<void> {
  await adjustSquareInventory(
    items.map((item) => ({
      squareVariationId: item.squareVariationId,
      quantity: Math.abs(item.quantity),
    })),
    idempotencyKey,
  )
}
