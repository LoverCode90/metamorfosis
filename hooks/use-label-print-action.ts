"use client"

import { useCallback, useRef, useState } from "react"

import { buildLabelPrintUrls } from "@/lib/admin/label-print-urls"

interface UseLabelPrintActionOptions {
  orderId: string
  isDialogOpen: boolean
}

/** Handles iframe and blob fallback printing for Shippo label PDFs. */
export function useLabelPrintAction({
  orderId,
  isDialogOpen,
}: UseLabelPrintActionOptions) {
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
      const frame = iframeRef.current
      if (frame?.contentWindow && iframeReady) {
        frame.contentWindow.focus()
        frame.contentWindow.print()
        return
      }

      const response = await fetch(pdfUrl)
      if (!response.ok) throw new Error("Could not load label PDF")
      const blob = await response.blob()
      const blobUrl = URL.createObjectURL(blob)
      const printWindow = window.open(blobUrl, "_blank")
      if (!printWindow) {
        throw new Error("Pop-up blocked — allow pop-ups to print")
      }
      printWindow.addEventListener("load", () => {
        printWindow.focus()
        printWindow.print()
      })
      window.setTimeout(() => URL.revokeObjectURL(blobUrl), 60_000)
    } catch (printError: unknown) {
      const message =
        printError instanceof Error ? printError.message : "Print failed"
      window.alert(message)
    } finally {
      setIsPrinting(false)
    }
  }, [iframeReady, pdfUrl])

  const isPrintDisabled = isPrinting || (!iframeReady && isDialogOpen)

  return {
    iframeRef,
    pdfUrl,
    iframeReady,
    isPrinting,
    isPrintDisabled,
    handlePrint,
    markIframeReady,
    resetIframeReady,
  }
}
