import type {
  LicenseInfo,
  UploadedFile,
} from "@/components/profile/verify-steps"

export type LicenseUploadStatus = "approved" | "pending_review" | "rejected"

export interface LicenseUploadResult {
  ok: boolean
  status: LicenseUploadStatus
  message: string
  error?: string
}

/**
 * Uploads a license document plus metadata for verification.
 * @param info - License details entered in the wizard.
 * @param file - The selected document to upload.
 * @returns The parsed verification outcome; `ok` reflects HTTP + payload success.
 */
export async function uploadLicense(
  info: LicenseInfo,
  file: UploadedFile,
): Promise<LicenseUploadResult> {
  const formData = new FormData()
  formData.append("file", file.file)
  formData.append("profession", info.profession)
  formData.append("licenseNumber", info.licenseNumber)
  if (info.businessName) formData.append("businessName", info.businessName)

  const res = await fetch("/api/profile/license/upload", {
    method: "POST",
    body: formData,
  })
  const data = (await res.json()) as LicenseUploadResult
  return { ...data, ok: res.ok && data.ok }
}
