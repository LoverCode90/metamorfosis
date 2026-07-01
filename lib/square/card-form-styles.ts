/** Shared Square Web Payments card field styles (dark storefront). */
export const SQUARE_CARD_FORM_STYLES = {
  input: {
    color: "#f4f5f8",
    backgroundColor: "#070709",
    fontSize: "16px",
  },
  "input::placeholder": { color: "#68686f" },
  ".input-container": {
    borderColor: "#28292b",
    borderRadius: "8px",
  },
  ".input-container.is-focus": { borderColor: "#4361ee" },
  ".input-container.is-error": { borderColor: "#f9667a" },
  ".message-text": {
    color: "#e8e8ed",
  },
  ".message-icon": {
    color: "#fbbf24",
  },
} as const
