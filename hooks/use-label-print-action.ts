"use client"

import { useCallback, useRef, useState } from "react"

import { buildLabelPrintUrls } from "@/lib/admin/label-print-urls"
import { printLabelPdfFromUrl } from "@/lib/admin/print-label-pdf"

interface UseLabelPrintActionOptions {
  orderId: string
}

/** Preview iframe + blob-based print (avoids cross-origin iframe.print on mobile). */
export function useLabelPrintAction({ orderId }: UseLabelPrintActionOptions) {
  const iframeRef = useRef<HTMLIFrameElement>(null)
  const [iframeReady, setIframeReady] = useState(false)
  const [isPrinting, setIsPrinting] = useState(false)
  const { pdfUrl } = buildLabelPrintUrls(orderId)

  const resetIframeReady = useCallback(() => {
    setIframeReady(false)
  }, [])

  const markIframeReady = useCallback(() => {
    setIframeReady(true)
  }, [])

  const handlePrint = useCallback(async () => {
    setIsPrinting(true)
    try {
      await printLabelPdfFromUrl(pdfUrl)
    } catch (printError: unknown) {
      const message =
        printError instanceof Error ? printError.message : "Print failed"
      window.alert(message)
    } finally {
      setIsPrinting(false)
    }
  }, [pdfUrl])

  return {
    iframeRef,
    pdfUrl,
    iframeReady,
    isPrinting,
    isPrintDisabled: isPrinting,
    handlePrint,
    markIframeReady,
    resetIframeReady,
  }
}
