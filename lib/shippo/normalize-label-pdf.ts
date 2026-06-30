import "server-only"

import { PDFDocument, degrees } from "pdf-lib"

/** 4×6 inches in PDF points (72 pt/in). */
const LABEL_WIDTH_PT = 4 * 72
const LABEL_HEIGHT_PT = 6 * 72

/**
 * Rebuilds Shippo labels on a portrait 4×6 page. Shippo often delivers a
 * landscape PDF (content sideways); setRotation alone does not fix all viewers.
 */
export async function normalizeLabelPdfToPortrait(
  pdfBytes: ArrayBuffer,
): Promise<Uint8Array> {
  const sourceDocument = await PDFDocument.load(pdfBytes)
  const [sourcePage] = sourceDocument.getPages()
  const { width: sourceWidth, height: sourceHeight } = sourcePage.getSize()

  const outputDocument = await PDFDocument.create()
  const outputPage = outputDocument.addPage([LABEL_WIDTH_PT, LABEL_HEIGHT_PT])

  const [embeddedPage] = await outputDocument.embedPdf(sourceDocument, [0])

  if (sourceWidth > sourceHeight) {
    outputPage.drawPage(embeddedPage, {
      x: 0,
      y: LABEL_HEIGHT_PT,
      width: LABEL_HEIGHT_PT,
      height: LABEL_WIDTH_PT,
      rotate: degrees(-90),
    })
  } else {
    outputPage.drawPage(embeddedPage, {
      x: 0,
      y: 0,
      width: LABEL_WIDTH_PT,
      height: LABEL_HEIGHT_PT,
    })
  }

  return outputDocument.save()
}
