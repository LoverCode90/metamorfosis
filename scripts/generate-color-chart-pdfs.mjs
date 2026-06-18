/**
 * One-time script: generates minimal placeholder PDFs in public/color-charts/.
 * Each PDF is a valid single-page document with a title line.
 * Run: node scripts/generate-color-chart-pdfs.mjs
 *
 * Real PDFs are dropped in by the store owner later — just replace the files.
 */
import { writeFileSync, mkdirSync } from "fs"
import { join, dirname } from "path"
import { fileURLToPath } from "url"

const __dirname = dirname(fileURLToPath(import.meta.url))
const OUT_DIR = join(__dirname, "..", "public", "color-charts")

mkdirSync(OUT_DIR, { recursive: true })

const charts = [
  { file: "earthia-color.pdf", title: "Earthia Color" },
  { file: "nutrapel-uhd-cp.pdf", title: "Nutrapel UHD CP" },
  { file: "rbl-gama.pdf", title: "RBL Gama" },
  { file: "color-tech-gama.pdf", title: "Color Tech Gama" },
  { file: "color-tech-zero.pdf", title: "Color Tech Zero" },
]

/**
 * Builds the smallest valid PDF 1.4 document that renders a centered text line.
 * Uses only built-in Helvetica-Bold so there's no font embedding needed.
 */
function buildPdf(title) {
  const text = `${title} \u2014 Color Chart (placeholder)`
  const safePdfStr = (s) =>
    s.replace(/\\/g, "\\\\").replace(/\(/g, "\\(").replace(/\)/g, "\\)")

  const stream =
    `BT\n` +
    `/F1 18 Tf\n` +
    `72 720 Td\n` +
    `(${safePdfStr(text)}) Tj\n` +
    `0 -28 Td\n` +
    `(This is a placeholder. Replace with the real color chart PDF.) Tj\n` +
    `ET`

  const streamBytes = Buffer.byteLength(stream, "latin1")

  const objects = []

  // 1: catalog
  objects.push(`1 0 obj\n<< /Type /Catalog /Pages 2 0 R >>\nendobj`)
  // 2: pages
  objects.push(`2 0 obj\n<< /Type /Pages /Kids [3 0 R] /Count 1 >>\nendobj`)
  // 3: page
  objects.push(
    `3 0 obj\n<< /Type /Page /Parent 2 0 R /MediaBox [0 0 612 792]\n` +
      `   /Contents 4 0 R /Resources << /Font << /F1 5 0 R >> >> >>\nendobj`,
  )
  // 4: content stream
  objects.push(
    `4 0 obj\n<< /Length ${streamBytes} >>\nstream\n${stream}\nendstream\nendobj`,
  )
  // 5: font
  objects.push(
    `5 0 obj\n<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica-Bold\n` +
      `   /Encoding /WinAnsiEncoding >>\nendobj`,
  )

  const header = "%PDF-1.4\n"
  let body = ""
  const offsets = []
  objects.forEach((obj) => {
    offsets.push(header.length + body.length)
    body += obj + "\n"
  })

  const xrefOffset = header.length + body.length
  let xref = `xref\n0 ${objects.length + 1}\n`
  xref += `0000000000 65535 f \n`
  offsets.forEach((o) => {
    xref += `${String(o).padStart(10, "0")} 00000 n \n`
  })

  const trailer =
    `trailer\n<< /Size ${objects.length + 1} /Root 1 0 R >>\n` +
    `startxref\n${xrefOffset}\n%%EOF`

  return header + body + xref + trailer
}

for (const { file, title } of charts) {
  const dest = join(OUT_DIR, file)
  writeFileSync(dest, buildPdf(title), "latin1")
  console.log(`✓ ${file}`)
}

console.log(`\nAll 5 placeholder PDFs written to public/color-charts/`)
