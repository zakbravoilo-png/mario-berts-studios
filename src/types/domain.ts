/**
 * Domain models (handoff §7). Money is always whole pesos (integer).
 * Times are ISO strings with a +08:00 offset (Asia/Manila).
 */

export type Peso = number

export interface RoomIncludedEquipment {
  id: string
  name: string
  quantity: number
  note?: string
}

export interface Room {
  id: string
  name: string
  number: 1 | 2 | 3
  description: string
  /** Photo registry key (see data/photos.ts); null = no photo yet. */
  photo: string | null
  includedEquipment: RoomIncludedEquipment[]
  active: boolean
}

export type RentalCategory = 'cable' | 'guitar' | 'bass' | 'keys' | 'mic' | 'amp'
export type PricingUnit = 'per_item' | 'per_kit'

/** Rental item id. Seed ids: guitar-cable, electric-guitar, bass-guitar, acoustic-guitar,
 * mic-kit, keyboard-kit, extra-guitar-amp, extra-bass-amp. Admin can add more. */
export type RentalEquipmentId = string

export interface RentalEquipment {
  id: RentalEquipmentId
  name: string
  shortName: string
  category: RentalCategory
  /** Charged once per reservation, never per hour. */
  unitPrice: Peso
  /** Studio-wide shared stock across all three rooms. null = unknown. */
  totalQuantity: number | null
  pricingUnit: PricingUnit
  note?: string
  /** false = removed by admin (kept so existing bookings still show it). */
  active: boolean
  /** Temporarily unavailable (e.g. broken) — 0 available, still listed. */
  outOfService: boolean
}

/** Stock held by one booking for its time range (derived; see availability.ts). */
export interface InventoryReservation {
  bookingId: string
  itemId: RentalEquipmentId
  quantity: number
  startAt: string
  endAt: string
}

export interface CustomerDetails {
  name: string
  email: string
  phone: string
  bandName?: string
  notes?: string
}

export interface Customer extends CustomerDetails {
  id: string
  isDemo: true
}

export interface BookingEquipmentItem {
  itemId: RentalEquipmentId
  quantity: number
  /** Price at the time of booking — later price edits don't change existing bookings. */
  unitPrice: Peso
  /** Item name at the time of booking. */
  label?: string
}

export type PaymentStatus = 'not_submitted' | 'submitted' | 'verified' | 'rejected'

/** Mock GCash downpayment record. Nothing is processed. */
export interface Payment {
  id: string
  bookingId: string
  method: 'gcash'
  amount: Peso
  reference: string | null
  /** Mock only — the file name the customer picked; no file is uploaded. */
  proofFileName: string | null
  status: PaymentStatus
  submittedAt: string | null
  verifiedAt: string | null
}

export type RehearsalStatus =
  | 'awaiting_payment'
  | 'awaiting_verification'
  | 'confirmed'
  | 'completed'
  | 'cancelled'
  | 'rejected'

export interface RehearsalBooking {
  id: string
  reference: string
  customerId: string
  customer: CustomerDetails
  roomId: string
  startAt: string
  endAt: string
  durationHours: number
  selectedEquipment: BookingEquipmentItem[]
  roomSubtotal: Peso
  equipmentSubtotal: Peso
  total: Peso
  downpaymentRequired: Peso
  balance: Peso
  payment: Payment
  status: RehearsalStatus
  createdAt: string
  cancelledAt?: string
  adminNote?: string
}

export type LessonType = 'drums' | 'guitar' | 'bass' | 'keyboard' | 'piano' | 'voice'
export type LessonLevel = 'beginner' | 'intermediate'
export type LessonStatus = 'requested' | 'confirmed' | 'completed' | 'declined' | 'cancelled'

/** One weekly availability window. day: 0 = Sunday … 6 = Saturday. */
export interface WeeklySlot {
  day: number
  start: string
  end: string
}

export interface Instructor {
  id: string
  displayName: string
  instruments: LessonType[]
  levels: LessonLevel[]
  weeklyAvailability: WeeklySlot[]
  active: boolean
  isDemo: true
}

export interface LessonRequest {
  id: string
  reference: string
  customerId: string
  customer: CustomerDetails
  lessonType: LessonType
  level: LessonLevel
  instructorId: string
  roomId: string
  startAt: string
  endAt: string
  durationMinutes: number
  /** Price per session (beginner ₱500, intermediate ₱750); null = to be confirmed. */
  sessionPrice: Peso | null
  status: LessonStatus
  createdAt: string
}

export type InquiryStatus = 'pending' | 'responded' | 'closed'

export interface StreamingInquiry {
  id: string
  reference: string
  customerId: string
  customer: CustomerDetails
  eventDate: string
  estimatedHours: number
  eventLocation: string
  description: string
  /** ₱500 × hours — an estimate; packages are to be confirmed. */
  estimatedPrice: Peso
  status: InquiryStatus
  createdAt: string
}

export type ShopCategory = 'acoustic-strings' | 'electric-strings' | 'bass-strings' | 'drumsticks'

export interface ShopProduct {
  id: string
  name: string
  brand: string | null
  category: ShopCategory
  description: string
  /** null = to be confirmed. */
  price: Peso | null
  /** null = to be confirmed. */
  stock: number | null
  /** true = sample listing invented for the prototype. */
  isDemo: boolean
  /** false = hidden from the shop. */
  active: boolean
  /** Shown as "Out of stock"; can't be added to an inquiry. */
  outOfStock: boolean
}

export interface ShopInquiry {
  id: string
  reference: string
  customerId: string
  customer: CustomerDetails
  items: { productId: string; quantity: number }[]
  message: string
  status: InquiryStatus
  createdAt: string
}

export type NotificationEvent =
  | 'booking_received'
  | 'payment_submitted'
  | 'booking_confirmed'
  | 'booking_cancelled'
  | 'booking_rejected'
  | 'lesson_requested'
  | 'lesson_confirmed'
  | 'lesson_declined'
  | 'lesson_cancelled'

/** A confirmation message. In the prototype every message is 'simulated' — nothing is sent. */
export interface Notification {
  id: string
  channel: 'sms' | 'email'
  to: string
  reference: string
  event: NotificationEvent
  subject: string | null
  body: string
  createdAt: string
  status: 'simulated'
}

export interface BusinessSettings {
  timezone: 'Asia/Manila'
  /** 24h "HH:MM", Asia/Manila. Confirmed: 09:00–21:00. */
  openTime: string
  closeTime: string
  /** Demo assumption — configurable, owner to confirm. */
  slotMinutes: number
  minBookingHours: number
  roomRatePerHour: Peso
  downpaymentRate: number
  streamingRatePerHour: Peso
  lessonPrices: Record<LessonLevel, Peso | null>
  /** Confirmed: fixed by level (no picker) — beginner 30, intermediate 60. */
  lessonDurationMinutes: Record<LessonLevel, number>
  /** Demo assumption — lesson start increments, configurable. */
  lessonSlotMinutes: number
  /** Statuses that hold the room and shared stock. Default is a demo assumption. */
  inventoryHoldStatuses: RehearsalStatus[]
  lessonRoomHoldStatuses: LessonStatus[]
  /** null → "GCash details to be provided by studio". Never invent a number. */
  gcashInstructions: string | null
}
