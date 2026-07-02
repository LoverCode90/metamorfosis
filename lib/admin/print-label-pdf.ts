function isMobileUserAgent(): boolean {
  if (typeof navigator === "undefined") return false
  return /Android|iPhone|iPad|iPod|Mobile/i.test(navigator.userAgent)
}

function revokeBlobUrlLater(blobUrl: string): void {
  window.setTimeout(() => URL.revokeObjectURL(blobUrl), 60_000)
}

function printViaHiddenBlobFrame(blobUrl: string): Promise<void> {
  return new Promise((resolve, reject) => {
    const printFrame = document.createElement("iframe")
    printFrame.setAttribute("aria-hidden", "true")
    printFrame.style.cssText =
      "position:fixed;width:0;height:0;border:0;visibility:hidden"
    document.body.appendChild(printFrame)

    const cleanupFrame = () => {
      printFrame.remove()
    }

    printFrame.onload = () => {
      try {
        const frameWindow = printFrame.contentWindow
        if (!frameWindow) {
          cleanupFrame()
          reject(new Error("Could not open print preview"))
          return
        }

        let settled = false
        const finish = () => {
          if (settled) return
          settled = true
          frameWindow.removeEventListener("afterprint", finish)
          cleanupFrame()
          resolve()
        }

        frameWindow.addEventListener("afterprint", finish, { once: true })
        frameWindow.focus()
        window.setTimeout(() => {
          try {
            frameWindow.print()
            // Some browsers never fire afterprint for hidden iframes.
            window.setTimeout(finish, 1500)
          } catch (error: unknown) {
            frameWindow.removeEventListener("afterprint", finish)
            cleanupFrame()
            reject(error)
          }
        }, 150)
      } catch (printError: unknown) {
        cleanupFrame()
        reject(printError)
      }
    }

    printFrame.onerror = () => {
      cleanupFrame()
      reject(new Error("Could not load label for printing"))
    }

    printFrame.src = blobUrl
  })
}

function openPdfInNewTab(blobUrl: string): void {
  const printWindow = window.open(blobUrl, "_blank")
  if (!printWindow) {
    throw new Error("Pop-up blocked — use Download or Open in tab to print")
  }
}

/** Prints a label PDF fetched from our same-origin proxy URL. */
export async function printLabelPdfFromUrl(pdfUrl: string): Promise<void> {
  const response = await fetch(pdfUrl, { credentials: "include" })
  if (!response.ok) {
    throw new Error("Could not load label PDF")
  }

  const pdfBlob = await response.blob()
  const blobUrl = URL.createObjectURL(pdfBlob)

  try {
    if (isMobileUserAgent()) {
      openPdfInNewTab(blobUrl)
      return
    }

    await printViaHiddenBlobFrame(blobUrl)
  } catch {
    openPdfInNewTab(blobUrl)
  } finally {
    revokeBlobUrlLater(blobUrl)
  }
}
