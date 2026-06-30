import "server-only"

/** True when Vercel uses a Shippo test API token (SAMPLE labels, no real postage). */
export function isShippoTestMode(): boolean {
  return process.env.SHIPPO_API_KEY?.startsWith("shippo_test_") ?? false
}
