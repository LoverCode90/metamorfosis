// Barrel for the license-verification step components. Kept so existing
// imports from "./verify-steps" continue to work after the split.
export type { LicenseInfo, UploadedFile } from "./verify-step-types"
export { InfoStep } from "./verify-step-info"
export { UploadStep } from "./verify-step-upload"
export { SummaryStep } from "./verify-step-summary"
export { VerifyStepIndicator } from "./verify-step-indicator"
