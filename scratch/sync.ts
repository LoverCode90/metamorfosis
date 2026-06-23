import { runFullCatalogSync } from "../lib/square/sync"

async function main() {
  console.log("Starting full catalog sync...")
  try {
    const stats = await runFullCatalogSync()
    console.log("Sync complete!", stats)
  } catch (e) {
    console.error("Sync failed:", e)
  }
  process.exit(0)
}

main()
