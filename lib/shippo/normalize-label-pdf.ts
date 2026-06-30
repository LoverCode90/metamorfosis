import "server-only"

import { PDFDocument, degrees } from "pdf-lib"

/**
 * Shippo PDF_4x6 labels often arrive landscape (content sideways). Rotate to
 * portrait so 4×6 thermal printers receive a vertical, centered label.
 */
export async function normalizeLabelPdfToPortrait(
  pdfBytes: ArrayBuffer,
): Promise<Uint8Array> {
  const pdfDocument = await PDFDocument.load(pdfBytes)
  const pages = pdfDocument.getPages()

  for (const page of pages) {
    const { width, height } = page.getSize()
    const isLandscape = width > height

    if (isLandscape) {
      page.setRotation(degrees(90))
    }
  }

  return pdfDocument.save()
}
