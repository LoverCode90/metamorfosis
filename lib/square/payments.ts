import { SquareClient, SquareEnvironment } from "square"
import crypto from "crypto"

/** Production Square credentials — always use Production API. */
function createPaymentsClient() {
  return new SquareClient({
    token: process.env.SQUARE_ACCESS_TOKEN!,
    environment: SquareEnvironment.Production,
  })
}

export interface ChargeResult {
  ok: true
  paymentId: string
  squareOrderId: string
  receiptUrl: string | null
}

export interface ChargeError {
  ok: false
  error: string
}

/**
 * Charge a tokenized card or card-on-file (COF) via Square Payments API.
 * sourceId comes from the Square Web Payments SDK card nonce or ccof: token.
 */
export async function chargeCard(
  sourceId: string,
  amountCents: number,
  locationId: string,
  note?: string,
): Promise<ChargeResult | ChargeError> {
  // Dev/staging: tokenize via production Web Payments SDK but skip the charge.
  if (process.env.NEXT_PUBLIC_PAYMENT_MODE === "test") {
    return {
      ok: true,
      paymentId: `test-${crypto.randomUUID()}`,
      squareOrderId: "",
      receiptUrl: null,
    }
  }

  const client = createPaymentsClient()
  const idempotencyKey = crypto.randomUUID()

  try {
    const result = await client.payments.create({
      sourceId,
      idempotencyKey,
      amountMoney: {
        amount: BigInt(amountCents),
        currency: "USD",
      },
      locationId,
      note,
      autocomplete: true,
    })

    const payment = result.payment

    if (!payment) {
      return { ok: false, error: "No payment returned from Square" }
    }

    return {
      ok: true,
      paymentId: payment.id ?? "",
      squareOrderId: payment.orderId ?? "",
      receiptUrl: payment.receiptUrl ?? null,
    }
  } catch (err) {
    const msg = err instanceof Error ? err.message : "Payment failed"
    console.error("[square/payments] charge error:", err)
    return { ok: false, error: msg }
  }
}

/**
 * Search for an existing Square Customer by referenceId (Supabase user.id),
 * or create a new Customer if none exists.
 */
export async function getOrCreateCustomer(
  userId: string,
  email: string,
  fullName: string,
): Promise<string | null> {
  // Bypass if payment mode is simulation/test to avoid production Square rejection on test profiles
  if (process.env.NEXT_PUBLIC_PAYMENT_MODE === "test") {
    return `cust-test-${crypto.randomUUID().slice(0, 8)}`
  }

  const client = createPaymentsClient()

  try {
    // Step 1: Search existing customers matching the Supabase user ID exactly
    const searchResult = await client.customers.search({
      query: {
        filter: {
          referenceId: {
            exact: userId,
          },
        },
      },
    })

    if (searchResult.customers && searchResult.customers.length > 0) {
      return searchResult.customers[0].id ?? null
    }

    // Step 2: If no customer found, create a new Square Customer
    const createResult = await client.customers.create({
      idempotencyKey: crypto.randomUUID(),
      referenceId: userId,
      emailAddress: email,
      givenName: fullName,
    })

    return createResult.customer?.id ?? null
  } catch (err) {
    console.error("[square/payments] getOrCreateCustomer error:", err)
    return null
  }
}

/**
 * Create a permanent Card on File (COF) using the frontend nonce and customerId.
 * Returns the permanent cardId (e.g. ccof:...).
 */
export async function createCardOnFile(
  sourceId: string,
  customerId: string,
): Promise<string | null> {
  if (sourceId.startsWith("ccof:")) {
    return sourceId
  }

  // Bypass if payment mode is simulation/test to securely save a simulated token inside Supabase
  if (process.env.NEXT_PUBLIC_PAYMENT_MODE === "test") {
    return `ccof:test-${crypto.randomUUID().slice(0, 8)}`
  }

  const client = createPaymentsClient()

  try {
    // Invoke createCard to store the card permanently against the customer
    const result = await client.cards.create({
      idempotencyKey: crypto.randomUUID(),
      sourceId,
      card: { customerId },
    })

    return result.card?.id ?? null
  } catch (err) {
    console.error("[square/payments] createCardOnFile error:", err)
    return null
  }
}

export interface CardMetadata {
  brand: string
  last4: string
  expMonth: number
  expYear: number
}

/**
 * Retrieve card brand and expiry metadata after createCardOnFile.
 * Returns null on error — callers should skip saving rather than failing.
 */
export async function retrieveCardMetadata(
  cardId: string,
): Promise<CardMetadata | null> {
  if (process.env.NEXT_PUBLIC_PAYMENT_MODE === "test") {
    // Matches Square test card 4111 1111 1111 1111.
    return {
      brand: "VISA",
      last4: "1111",
      expMonth: 12,
      expYear: 2030,
    }
  }

  const client = createPaymentsClient()

  try {
    const result = await client.cards.get({ cardId })
    const card = result.card
    if (!card) return null

    return {
      brand: card.cardBrand ?? "UNKNOWN",
      last4: card.last4 ?? "0000",
      expMonth: Number(card.expMonth ?? 1),
      expYear: Number(card.expYear ?? 2000),
    }
  } catch (err) {
    console.error("[square/payments] retrieveCardMetadata error:", err)
    return null
  }
}

/**
 * Disable a card on file in Square (permanent — cannot be re-enabled).
 * Returns true on success; false on error. Callers should proceed with
 * the DB delete regardless, since the card is no longer trusted either way.
 */
export async function disableCard(cardId: string): Promise<boolean> {
  if (process.env.NEXT_PUBLIC_PAYMENT_MODE === "test") {
    return true
  }

  const client = createPaymentsClient()

  try {
    await client.cards.disable({ cardId })
    return true
  } catch (err) {
    console.error("[square/payments] disableCard error:", err)
    return false
  }
}
