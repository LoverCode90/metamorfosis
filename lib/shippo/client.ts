import "server-only"

import { Shippo } from "shippo"

let _client: Shippo | null = null

/**
 * Lazy singleton for the Shippo SDK client.
 * Shippo uses "ShippoToken <key>" as the authorization header.
 */
export function createShippoClient(): Shippo {
  if (_client) return _client
  const key = process.env.SHIPPO_API_KEY
  if (!key) throw new Error("SHIPPO_API_KEY is not set")
  _client = new Shippo({ apiKeyHeader: `ShippoToken ${key}` })
  return _client
}
