import "server-only"

import { SquareClient, SquareEnvironment } from "square"

/**
 * Server-only Square API client using the production catalog.
 * Catalog reads hit real inventory from Day 1 (no sandbox rebuild).
 */
export function createSquareClient() {
  return new SquareClient({
    token: process.env.SQUARE_ACCESS_TOKEN!,
    environment: SquareEnvironment.Production,
  })
}
