/**
 * Demo actions. Every write re-validates against the current store so a stale
 * screen can't double-book. In production these become API calls with
 * server-side, transactional checks — client checks alone are not enough.
 */
import type {
  BusinessSettings,
  Customer,
  CustomerDetails,
  Instructor,
  InquiryStatus,
  LessonLevel,
  LessonRequest,
  LessonType,
  RehearsalBooking,
  RentalEquipmentId,
  ShopInquiry,
  ShopProduct,
  StreamingInquiry,
} from '../types/domain'
import { availabilityContext, getState, newId, nextReference, setState } from './demoStore'
import {
  canCustomerCancel,
  validateLessonRequest,
  validateRehearsalRequest,
} from '../features/booking/availability'
import { priceRehearsal } from '../features/booking/pricing'
import { getRental } from '../data/rentalEquipment'
import { normalizePhone } from '../features/booking/customerSchema'
import { lessonNotifications, rehearsalNotifications } from './notifications'
import type { Notification, NotificationEvent } from '../types/domain'
import { addMinutes, toManilaIso } from '../utils/time'

export type Result<T> = { ok: true; value: T } | { ok: false; errors: string[] }

const nowIso = () => toManilaIso(Date.now())

// ── Rehearsals ────────────────────────────────────────────────────────────

export interface NewRehearsal {
  roomId: string
  startAt: string
  hours: number
  equipment: { itemId: RentalEquipmentId; quantity: number }[]
  customer: CustomerDetails
  /** Account id, or 'guest' for bookings made without an account. */
  customerId: string
  /** Mock GCash submission; omit to save as "awaiting payment". */
  payment?: { reference: string; proofFileName: string | null }
}

export function createRehearsalBooking(input: NewRehearsal): Result<RehearsalBooking> {
  const s = getState()
  const endAt = addMinutes(input.startAt, input.hours * 60)
  const equipment = input.equipment.filter((e) => e.quantity > 0)
  const issues = validateRehearsalRequest({ roomId: input.roomId, startAt: input.startAt, endAt, equipment }, availabilityContext(s), {
    now: Date.now(),
  })
  if (issues.length) return { ok: false, errors: issues.map((i) => i.message) }

  const price = priceRehearsal(input.hours, equipment, s.settings.roomRatePerHour, s.settings.downpaymentRate)
  const { reference, counters } = nextReference(s, 'MBS')
  const id = newId('bk')
  const at = nowIso()
  const booking: RehearsalBooking = {
    id,
    reference,
    customerId: input.customerId,
    customer: input.customer,
    roomId: input.roomId,
    startAt: input.startAt,
    endAt,
    durationHours: input.hours,
    selectedEquipment: equipment.map((e) => ({ ...e, unitPrice: getRental(e.itemId).unitPrice })),
    roomSubtotal: price.roomSubtotal,
    equipmentSubtotal: price.equipmentSubtotal,
    total: price.total,
    downpaymentRequired: price.downpayment,
    balance: price.balance,
    payment: {
      id: newId('pay'),
      bookingId: id,
      method: 'gcash',
      amount: price.downpayment,
      reference: input.payment?.reference ?? null,
      proofFileName: input.payment?.proofFileName ?? null,
      status: input.payment ? 'submitted' : 'not_submitted',
      submittedAt: input.payment ? at : null,
      verifiedAt: null,
    },
    status: input.payment ? 'awaiting_verification' : 'awaiting_payment',
    createdAt: at,
  }
  const notes = rehearsalNotifications(input.payment ? 'payment_submitted' : 'booking_received', booking, at)
  setState((st) => ({ ...st, bookings: [...st.bookings, booking], counters, notifications: [...st.notifications, ...notes] }))
  return { ok: true, value: booking }
}

function updateBooking(id: string, fn: (b: RehearsalBooking) => RehearsalBooking, event?: NotificationEvent) {
  setState((st) => {
    let notes: Notification[] = []
    const bookings = st.bookings.map((b) => {
      if (b.id !== id) return b
      const next = fn(b)
      if (event) notes = rehearsalNotifications(event, next, nowIso())
      return next
    })
    return { ...st, bookings, notifications: [...st.notifications, ...notes] }
  })
}

function notifyLesson(l: LessonRequest, event: NotificationEvent) {
  const s = getState()
  const name = s.instructors.find((i) => i.id === l.instructorId)?.displayName ?? 'your instructor'
  const notes = lessonNotifications(event, l, `${name} (demo)`, nowIso())
  setState((st) => ({ ...st, notifications: [...st.notifications, ...notes] }))
}

/** Customer submits a mock GCash reference for a booking that is awaiting payment. */
export function submitPayment(bookingId: string, reference: string, proofFileName: string | null): Result<RehearsalBooking> {
  const s = getState()
  const b = s.bookings.find((x) => x.id === bookingId)
  if (!b) return { ok: false, errors: ['Booking not found.'] }
  if (b.status !== 'awaiting_payment') return { ok: false, errors: ['This booking is not waiting for payment.'] }
  // awaiting_payment does not hold the room/stock, so re-check before it starts holding.
  const issues = validateRehearsalRequest(
    { roomId: b.roomId, startAt: b.startAt, endAt: b.endAt, equipment: b.selectedEquipment },
    availabilityContext(s),
    { ignoreId: b.id, now: Date.now() },
  )
  if (issues.length) return { ok: false, errors: ['The room or equipment is no longer free for this time.', ...issues.map((i) => i.message)] }
  const at = nowIso()
  updateBooking(bookingId, (x) => ({
    ...x,
    status: 'awaiting_verification',
    payment: { ...x.payment, reference, proofFileName, status: 'submitted', submittedAt: at },
  }), 'payment_submitted')
  return { ok: true, value: getState().bookings.find((x) => x.id === bookingId)! }
}

/** Demo admin: mark the mock downpayment verified and confirm the booking. */
export function adminVerifyAndConfirm(bookingId: string): Result<null> {
  const b = getState().bookings.find((x) => x.id === bookingId)
  if (!b) return { ok: false, errors: ['Booking not found.'] }
  if (b.status !== 'awaiting_verification') return { ok: false, errors: ['Only bookings awaiting verification can be confirmed.'] }
  const at = nowIso()
  updateBooking(bookingId, (x) => ({ ...x, status: 'confirmed', payment: { ...x.payment, status: 'verified', verifiedAt: at } }), 'booking_confirmed')
  return { ok: true, value: null }
}

/** Demo admin action. Rejection policy is TBD — this is not a stated business policy. */
export function adminRejectBooking(bookingId: string, note: string): Result<null> {
  const b = getState().bookings.find((x) => x.id === bookingId)
  if (!b) return { ok: false, errors: ['Booking not found.'] }
  if (!['awaiting_payment', 'awaiting_verification'].includes(b.status)) return { ok: false, errors: ['Only unconfirmed bookings can be rejected in the demo.'] }
  updateBooking(bookingId, (x) => ({
    ...x,
    status: 'rejected',
    adminNote: note || undefined,
    payment: x.payment.status === 'submitted' ? { ...x.payment, status: 'rejected' } : x.payment,
  }), 'booking_rejected')
  return { ok: true, value: null }
}

/** Customer cancellation — only before the booking day (Asia/Manila). Downpayment is non-refundable. */
export function cancelBooking(bookingId: string): Result<null> {
  const b = getState().bookings.find((x) => x.id === bookingId)
  if (!b) return { ok: false, errors: ['Booking not found.'] }
  if (!['awaiting_payment', 'awaiting_verification', 'confirmed'].includes(b.status)) return { ok: false, errors: ['This booking can no longer be cancelled.'] }
  if (!canCustomerCancel(b.startAt)) return { ok: false, errors: ['Cancellation is only possible before the day of the booking.'] }
  updateBooking(bookingId, (x) => ({ ...x, status: 'cancelled', cancelledAt: nowIso() }), 'booking_cancelled')
  return { ok: true, value: null }
}

// ── Lessons ───────────────────────────────────────────────────────────────

export interface NewLesson {
  lessonType: LessonType
  level: LessonLevel
  startAt: string
  instructorId: string
  roomId: string
  customer: CustomerDetails
  customerId: string
}

export function createLessonRequest(input: NewLesson): Result<LessonRequest> {
  const s = getState()
  const durationMinutes = s.settings.lessonDurationMinutes[input.level]
  const endAt = addMinutes(input.startAt, durationMinutes)
  const issues = validateLessonRequest({ ...input, endAt }, availabilityContext(s), { now: Date.now() })
  if (issues.length) return { ok: false, errors: issues.map((i) => i.message) }
  const { reference, counters } = nextReference(s, 'MBL')
  const lesson: LessonRequest = {
    id: newId('ls'),
    reference,
    customerId: input.customerId,
    customer: input.customer,
    lessonType: input.lessonType,
    level: input.level,
    instructorId: input.instructorId,
    roomId: input.roomId,
    startAt: input.startAt,
    endAt,
    durationMinutes,
    sessionPrice: s.settings.lessonPrices[input.level],
    status: 'requested',
    createdAt: nowIso(),
  }
  setState((st) => ({ ...st, lessons: [...st.lessons, lesson], counters }))
  notifyLesson(lesson, 'lesson_requested')
  return { ok: true, value: lesson }
}

/** Demo admin: confirm / decline / reassign a lesson's room or instructor (re-validated). */
export function adminUpdateLesson(id: string, patch: Partial<Pick<LessonRequest, 'status' | 'roomId' | 'instructorId'>>): Result<null> {
  const s = getState()
  const l = s.lessons.find((x) => x.id === id)
  if (!l) return { ok: false, errors: ['Lesson not found.'] }
  const next = { ...l, ...patch }
  if (patch.roomId || patch.instructorId || (patch.status && ['requested', 'confirmed'].includes(patch.status))) {
    const issues = validateLessonRequest(next, availabilityContext(s), { ignoreId: id })
    if (issues.length) return { ok: false, errors: issues.map((i) => i.message) }
  }
  setState((st) => ({ ...st, lessons: st.lessons.map((x) => (x.id === id ? next : x)) }))
  if (patch.status === 'confirmed' && l.status !== 'confirmed') notifyLesson(next, 'lesson_confirmed')
  if (patch.status === 'declined') notifyLesson(next, 'lesson_declined')
  return { ok: true, value: null }
}

export function cancelLesson(id: string): Result<null> {
  const l = getState().lessons.find((x) => x.id === id)
  if (!l) return { ok: false, errors: ['Lesson not found.'] }
  if (!['requested', 'confirmed'].includes(l.status)) return { ok: false, errors: ['This lesson can no longer be cancelled.'] }
  setState((st) => ({ ...st, lessons: st.lessons.map((x) => (x.id === id ? { ...x, status: 'cancelled' } : x)) }))
  notifyLesson({ ...l, status: 'cancelled' }, 'lesson_cancelled')
  return { ok: true, value: null }
}

// ── Streaming & shop inquiries ───────────────────────────────────────────

export function createStreamingInquiry(input: Omit<StreamingInquiry, 'id' | 'reference' | 'customerId' | 'estimatedPrice' | 'status' | 'createdAt'> & { customerId: string }): Result<StreamingInquiry> {
  const s = getState()
  const { reference, counters } = nextReference(s, 'MBG')
  const inquiry: StreamingInquiry = {
    ...input,
    id: newId('st'),
    reference,
    customerId: input.customerId,
    estimatedPrice: input.estimatedHours * s.settings.streamingRatePerHour,
    status: 'pending',
    createdAt: nowIso(),
  }
  setState((st) => ({ ...st, streaming: [...st.streaming, inquiry], counters }))
  return { ok: true, value: inquiry }
}

export function setStreamingStatus(id: string, status: InquiryStatus) {
  setState((st) => ({ ...st, streaming: st.streaming.map((x) => (x.id === id ? { ...x, status } : x)) }))
}

export function createShopInquiry(input: { items: { productId: string; quantity: number }[]; message: string; customer: CustomerDetails; customerId: string }): Result<ShopInquiry> {
  if (input.items.length === 0) return { ok: false, errors: ['Pick at least one product.'] }
  const s = getState()
  const { reference, counters } = nextReference(s, 'MBO')
  const inquiry: ShopInquiry = { ...input, id: newId('sh'), reference, status: 'pending', createdAt: nowIso() }
  setState((st) => ({ ...st, shopInquiries: [...st.shopInquiries, inquiry], counters }))
  return { ok: true, value: inquiry }
}

export function setShopInquiryStatus(id: string, status: InquiryStatus) {
  setState((st) => ({ ...st, shopInquiries: st.shopInquiries.map((x) => (x.id === id ? { ...x, status } : x)) }))
}

// ── Admin configuration ──────────────────────────────────────────────────

export function adminSetStock(itemId: RentalEquipmentId, quantity: number) {
  setState((st) => ({ ...st, rentalStock: { ...st.rentalStock, [itemId]: Math.max(0, Math.floor(quantity)) } }))
}

export function adminUpdateSettings(patch: Partial<BusinessSettings>) {
  setState((st) => ({ ...st, settings: { ...st.settings, ...patch } }))
}

export function adminUpdateInstructor(inst: Instructor) {
  setState((st) => ({ ...st, instructors: st.instructors.map((x) => (x.id === inst.id ? inst : x)) }))
}

export function adminUpdateProduct(p: ShopProduct) {
  setState((st) => ({ ...st, products: st.products.map((x) => (x.id === p.id ? p : x)) }))
}

/** Demo sign-up. One account per contact number. */
export function createCustomer(details: CustomerDetails): Result<Customer> {
  const s = getState()
  if (s.customers.some((c) => normalizePhone(c.phone) === normalizePhone(details.phone))) return { ok: false, errors: ['An account with this contact number already exists. Sign in instead.'] }
  const customer: Customer = { ...details, id: newId('cust'), isDemo: true }
  setState((st) => ({ ...st, customers: [...st.customers, customer] }))
  return { ok: true, value: customer }
}

export function updateCustomerProfile(id: string, details: Partial<CustomerDetails>): Result<null> {
  const s = getState()
  if (details.phone && s.customers.some((c) => c.id !== id && normalizePhone(c.phone) === normalizePhone(details.phone!))) {
    return { ok: false, errors: ['Another account already uses this contact number.'] }
  }
  setState((st) => ({ ...st, customers: st.customers.map((c) => (c.id === id ? { ...c, ...details } : c)) }))
  return { ok: true, value: null }
}

// ── Guest lookup ──────────────────────────────────────────────────────────

/**
 * Find a booking or lesson by reference + contact number (guest access, no account).
 * DEMO ONLY: a real system needs a proper verification step (e.g. a one-time code)
 * because a reference and phone number are not strong proof of identity.
 */
export function findByReferenceAndPhone(reference: string, phone: string): { kind: 'rehearsal'; id: string } | { kind: 'lesson'; id: string } | null {
  const s = getState()
  const ref = reference.trim().toUpperCase()
  const p = normalizePhone(phone)
  if (!ref || p.length < 7) return null
  const b = s.bookings.find((x) => x.reference.toUpperCase() === ref && normalizePhone(x.customer.phone) === p)
  if (b) return { kind: 'rehearsal', id: b.id }
  const l = s.lessons.find((x) => x.reference.toUpperCase() === ref && normalizePhone(x.customer.phone) === p)
  if (l) return { kind: 'lesson', id: l.id }
  return null
}
