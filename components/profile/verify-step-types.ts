export interface LicenseInfo {
  businessName: string
  licenseNumber: string
  country: string
  profession: string
}

export interface UploadedFile {
  name: string
  size: string
  /** The actual File object — sent to the upload API as FormData. */
  file: File
}
