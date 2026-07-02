export interface PackingSlipItem {
  id: string
  quantity: number
  unitPriceCents: number
  productName: string
  variationName: string
}

export interface PackingSlipAddress {
  fullName?: string
  phone?: string
  email?: string
  streetLine1?: string
  streetLine2?: string
  city?: string
  state?: string
  zip?: string
}

export interface PackingSlipData {
  orderId: string
  createdAt: string
  isPickup: boolean
  address: PackingSlipAddress | null
  items: PackingSlipItem[]
  subtotalCents: number
  discountCents: number
  surchargeCents: number
  taxCents: number
  shippingCents: number
  totalCents: number
}
