/**
 * US phone helpers — continental only.
 * Hawaii (808) and Alaska (907) area codes are explicitly disallowed.
 */

const BLOCKED_AREA_CODES = new Set(["808", "907"])

/** Strip everything except digits and clip to 10 characters. */
export function digits(input: string): string {
  return input.replace(/\D/g, "").slice(0, 10)
}

/** Format a digit string as "(555) 555-5555" — partial input is partially formatted. */
export function formatPhone(input: string): string {
  const d = digits(input)
  if (d.length === 0) return ""
  if (d.length < 4) return `(${d}`
  if (d.length < 7) return `(${d.slice(0, 3)}) ${d.slice(3)}`
  return `(${d.slice(0, 3)}) ${d.slice(3, 6)}-${d.slice(6)}`
}

export type PhoneError =
  | "incomplete"
  | "blocked_area_code"
  | "invalid_area_code"

/** Validate a US continental phone number from raw user input. */
export function validatePhone(input: string): PhoneError | null {
  const d = digits(input)
  if (d.length === 0) return "incomplete"
  if (d.length < 10) return "incomplete"
  const area = d.slice(0, 3)
  if (BLOCKED_AREA_CODES.has(area)) return "blocked_area_code"
  // First digit of area code must be 2–9 per NANP, second digit 0–9.
  if (!/^[2-9]\d{2}$/.test(area)) return "invalid_area_code"
  return null
}

export function phoneErrorMessage(err: PhoneError): string {
  switch (err) {
    case "incomplete":
      return "Enter a 10-digit US phone number."
    case "blocked_area_code":
      return "Hawaii and Alaska area codes are not supported — continental US only."
    case "invalid_area_code":
      return "That doesn't look like a valid US area code."
  }
}
