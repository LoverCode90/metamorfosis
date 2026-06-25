import "server-only"

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
    // Invoke createPayment using modern SDK syntax, extracting result object
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
  // If sourceId is already a permanent card on file token, return it directly
  if (sourceId.startsWith("ccof:")) {
    return sourceId
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
