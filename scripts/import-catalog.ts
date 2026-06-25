import { SquareClient, SquareEnvironment } from "square"
import type { CatalogObject, CatalogCustomAttributeValue } from "square"
import { randomUUID } from "crypto"
import * as fs from "fs"
import * as path from "path"

const token = process.env.SQUARE_ACCESS_TOKEN
if (!token) {
  console.error("SQUARE_ACCESS_TOKEN is not set")
  process.exit(1)
}

const client = new SquareClient({
  token,
  environment: SquareEnvironment.Production,
})

type AttrMap = Record<string, CatalogCustomAttributeValue>

interface CsvRow {
  token: string
  version: string
  name: string
  package_class: string
  weight_lb: string
}

// Handles quoted fields and escaped double-quotes ("") correctly
function parseCsvLine(line: string): string[] {
  const result: string[] = []
  let current = ""
  let inQuotes = false
  for (let i = 0; i < line.length; i++) {
    const ch = line[i]
    if (ch === '"') {
      if (inQuotes && line[i + 1] === '"') {
        current += '"'
        i++
      } else {
        inQuotes = !inQuotes
      }
    } else if (ch === "," && !inQuotes) {
      result.push(current)
      current = ""
    } else {
      current += ch
    }
  }
  result.push(current)
  return result
}

function parseCsv(content: string): CsvRow[] {
  const lines = content.trim().split("\n")
  const headers = parseCsvLine(lines[0])
  return lines.slice(1).map((line) => {
    const vals = parseCsvLine(line)
    return Object.fromEntries(
      headers.map((h, i) => [h.trim(), (vals[i] ?? "").trim()]),
    ) as unknown as CsvRow
  })
}

// Same case-insensitive lookup as lib/square/attributes.ts — returns the raw
// map key so we can update it in place
function findAttrKey(attrs: AttrMap, name: string): string | undefined {
  const lower = name.toLowerCase()
  for (const [k, v] of Object.entries(attrs)) {
    const bare = k.includes(":") ? k.split(":").pop()! : k
    if (
      bare.toLowerCase() === lower ||
      v.name?.toLowerCase() === lower ||
      v.key?.toLowerCase() === lower
    ) {
      return k
    }
  }
  return undefined
}

function chunk<T>(arr: T[], size: number): T[][] {
  const chunks: T[][] = []
  for (let i = 0; i < arr.length; i += size) chunks.push(arr.slice(i, i + size))
  return chunks
}

const BATCH_SIZE = 20

async function main() {
  const csvPath = path.join(__dirname, "catalog-export.csv")
  if (!fs.existsSync(csvPath)) {
    console.error(`CSV not found: ${csvPath}`)
    process.exit(1)
  }

  const allRows = parseCsv(fs.readFileSync(csvPath, "utf8"))
  const rows = allRows.filter((r) => r.package_class || r.weight_lb)
  console.log(
    `${rows.length} rows to import (${allRows.length} total in CSV)\n`,
  )
  if (rows.length === 0) {
    console.log("Nothing to do.")
    return
  }

  // Pre-fetch CUSTOM_ATTRIBUTE_DEFINITION objects so we know the correct map
  // key to use when an attribute doesn't already exist on a given item
  console.log("Fetching custom attribute definitions...")
  const defKeyMap = new Map<string, string>() // bare name → definition key
  for await (const obj of await client.catalog.list({
    types: "CUSTOM_ATTRIBUTE_DEFINITION",
  })) {
    const defData = (obj as any).customAttributeDefinitionData
    if (!defData?.key) continue
    const bare = defData.key.includes(":")
      ? defData.key.split(":").pop()!
      : defData.key
    defKeyMap.set(bare.toLowerCase(), defData.key)
    if (defData.name) {
      defKeyMap.set(
        defData.name.toLowerCase().replace(/\s+/g, "_"),
        defData.key,
      )
    }
  }
  console.log(`Found ${defKeyMap.size} attribute definition keys\n`)

  let successCount = 0
  let failCount = 0

  for (const batch of chunk(rows, BATCH_SIZE)) {
    // 1. Fetch full current objects for this batch in one API call
    const batchGetResult = await client.catalog.batchGet({
      objectIds: batch.map((r) => r.token),
      includeRelatedObjects: false,
    })

    const objectMap = new Map<string, CatalogObject>()
    for (const obj of batchGetResult.objects ?? []) {
      if (obj.id) objectMap.set(obj.id, obj)
    }

    // 2. Merge only package_class and weight_lb — everything else untouched
    const toUpsert: CatalogObject[] = []

    for (const row of batch) {
      const current = objectMap.get(row.token)
      if (!current) {
        console.error(`  ✗ ${row.name} (${row.token}) — not found in Square`)
        failCount++
        continue
      }

      const attrs: AttrMap = { ...(current.customAttributeValues ?? {}) }

      if (row.package_class) {
        const existingKey = findAttrKey(attrs, "package_class")
        const mapKey =
          existingKey ?? defKeyMap.get("package_class") ?? "package_class"
        attrs[mapKey] = {
          ...(existingKey ? attrs[existingKey] : {}),
          name:
            (existingKey ? attrs[existingKey]?.name : undefined) ??
            "package_class",
          stringValue: row.package_class,
        }
      }

      if (row.weight_lb) {
        const existingKey = findAttrKey(attrs, "weight_lb")
        const mapKey = existingKey ?? defKeyMap.get("weight_lb") ?? "weight_lb"
        attrs[mapKey] = {
          ...(existingKey ? attrs[existingKey] : {}),
          name:
            (existingKey ? attrs[existingKey]?.name : undefined) ?? "weight_lb",
          numberValue: row.weight_lb,
        }
      }

      // Spread current object — preserves version, itemData, and all other
      // fields. Never touches price, stock, description, or images.
      toUpsert.push({ ...current, customAttributeValues: attrs })
    }

    if (toUpsert.length === 0) continue

    // 3. Send back the full merged objects
    try {
      const upsertResult = await client.catalog.batchUpsert({
        idempotencyKey: randomUUID(),
        batches: [{ objects: toUpsert }],
      })

      const upsertedIds = new Set(
        (upsertResult.objects ?? []).map((o: any) => o.id).filter(Boolean),
      )

      for (const obj of toUpsert) {
        const name = (obj as any).itemData?.name ?? obj.id ?? "unknown"
        if (obj.id && upsertedIds.has(obj.id)) {
          console.log(`  ✓ ${name}`)
          successCount++
        } else {
          console.error(`  ✗ ${name} — missing from upsert response`)
          failCount++
        }
      }
    } catch (err) {
      for (const obj of toUpsert) {
        const name = (obj as any).itemData?.name ?? obj.id ?? "unknown"
        console.error(
          `  ✗ ${name} — ${err instanceof Error ? err.message : String(err)}`,
        )
        failCount++
      }
    }
  }

  console.log(`\nDone: ${successCount} updated, ${failCount} failed`)
}

main().catch((err) => {
  console.error(err)
  process.exit(1)
})
