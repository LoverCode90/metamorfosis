import { SquareClient, SquareEnvironment } from "square"
import type { CatalogCustomAttributeValue } from "square"
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

// Same case-insensitive lookup strategy as lib/square/attributes.ts
function findAttrValue(attrs: AttrMap | undefined, key: string): string {
  if (!attrs) return ""
  const lower = key.toLowerCase()
  for (const [k, v] of Object.entries(attrs)) {
    const bare = k.includes(":") ? k.split(":").pop()! : k
    if (
      bare.toLowerCase() === lower ||
      v.name?.toLowerCase() === lower ||
      v.key?.toLowerCase() === lower
    ) {
      return v.stringValue ?? v.numberValue ?? ""
    }
  }
  return ""
}

function csvEscape(val: string): string {
  if (val.includes(",") || val.includes('"') || val.includes("\n")) {
    return `"${val.replace(/"/g, '""')}"`
  }
  return val
}

async function main() {
  console.log("Fetching ITEM objects from Square catalog...")

  const rows: string[] = ["token,version,name,package_class,weight_lb"]
  let count = 0

  for await (const obj of await client.catalog.list({ types: "ITEM" })) {
    if (obj.type !== "ITEM" || !obj.id) continue

    const name = obj.itemData?.name ?? ""
    const attrs = obj.customAttributeValues as AttrMap | undefined
    const packageClass = findAttrValue(attrs, "package_class")
    const weightLb = findAttrValue(attrs, "weight_lb")

    rows.push(
      [
        csvEscape(obj.id),
        csvEscape(String(obj.version ?? "")),
        csvEscape(name),
        csvEscape(packageClass),
        csvEscape(weightLb),
      ].join(","),
    )
    count++
  }

  const outPath = path.join(__dirname, "catalog-export.csv")
  fs.writeFileSync(outPath, rows.join("\n") + "\n", "utf8")
  console.log(`✓ Exported ${count} items → ${outPath}`)
}

main().catch((err) => {
  console.error(err)
  process.exit(1)
})
