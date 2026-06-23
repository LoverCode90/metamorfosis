/** Case reason — matches the public.return_reason DB enum. */
export type CaseReason =
  | "damaged"
  | "wrong_item"
  | "defective"
  | "not_as_described"
  | "no_longer_needed"
  | "ordered_by_mistake"
  | "other"

/** Case status — matches the public.case_status DB enum. */
export type CaseStatus =
  | "open"
  | "pending_review"
  | "approved"
  | "rejected"
  | "closed"

export interface DbCaseMessage {
  id: string
  sender_id: string
  message: string
  created_at: string
}

export interface DbCase {
  id: string
  customer_id: string
  order_id: string
  variation_id: string
  reason: CaseReason
  explanation: string
  evidence_images_urls: string[]
  status: CaseStatus
  shippo_return_transaction_id: string | null
  prepaid_label_url: string | null
  admin_notes: string | null
  resolved_at: string | null
  created_at: string
  updated_at: string
}

/** Customer case-tracking view: a case plus its message thread. */
export interface CaseWithMessages extends DbCase {
  case_messages: DbCaseMessage[]
}

/** Admin cases-list row — subset of fields plus joined customer + order. */
export interface AdminCaseListItem {
  id: string
  status: CaseStatus
  reason: CaseReason
  created_at: string
  profiles: { full_name: string; email: string } | null
  orders: { square_order_id: string } | null
}

/** Admin case-detail — full case plus joined relations. */
export interface AdminCaseDetail extends DbCase {
  profiles: {
    id: string
    full_name: string
    email: string
    phone_number: string | null
  } | null
  orders: {
    id: string
    square_order_id: string
    status: string
    created_at: string
    shipping_method: string
  } | null
  product_variations: {
    id: string
    name_en: string
    sku: string | null
    price_cents: number
    product_translations: { is_returnable: boolean } | null
  } | null
  case_messages: DbCaseMessage[]
}
