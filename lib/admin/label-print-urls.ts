export interface LabelPrintUrls {
  pdfUrl: string
  downloadUrl: string
}

/** Admin proxy URLs for a Shippo label PDF on an order. */
export function buildLabelPrintUrls(orderId: string): LabelPrintUrls {
  const pdfUrl = `/api/admin/orders/${orderId}/label/pdf`
  return { pdfUrl, downloadUrl: `${pdfUrl}?download=1` }
}
