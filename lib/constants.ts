/** Cart total threshold in cents for free shipping ($70.00). */
export const FREE_SHIPPING_THRESHOLD_CENTS = 7_000

/** Low-stock warning shown when variation inventory falls at or below this. */
export const LOW_STOCK_THRESHOLD = 4

/** Professional discount per color product in cents ($2.00). */
export const PRO_COLOR_DISCOUNT_CENTS = 200

/** Maximum file size in bytes for license / evidence uploads (10 MB). */
export const MAX_UPLOAD_BYTES = 10 * 1024 * 1024

/** Accepted MIME types for license verification uploads. */
export const ALLOWED_LICENSE_MIME_TYPES = [
  "image/jpeg",
  "image/png",
  "application/pdf",
] as const

/** Return window in calendar days (14-day policy). */
export const RETURN_WINDOW_DAYS = 14
