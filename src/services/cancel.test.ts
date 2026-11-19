import { describe, expect, it } from 'vitest'
import { adminCancelOutcome } from './actions'
import { createSeed } from '../data/seed'
import { rehearsalNotifications } from './notifications'
import type { RehearsalBooking } from '../types/domain'

const NOW = Date.parse('2026-11-16T10:00:00+08:00')
const seed = createSeed(NOW)
const confirmed = seed.bookings.find((b) => b.status === 'confirmed' && b.startAt > '2026-11-17')!
const unpaid = seed.bookings.find((b) => b.status === 'awaiting_payment')!
const dayBefore = Date.parse(confirmed.startAt) - 24 * 3600_000
const sameDayMorning = Date.parse(confirmed.startAt.slice(0, 10) + 'T08:00:00+08:00')

describe('studio cancellation and the downpayment', () => {
  it('before the booking day → refund due (studio returns GCash manually)', () => {
    expect(adminCancelOutcome(confirmed, dayBefore)).toBe('refund_due')
  })
  it('on the booking day → downpayment kept', () => {
    expect(adminCancelOutcome(confirmed, sameDayMorning)).toBe('downpayment_kept')
  })
  it('nothing paid yet → nothing to return', () => {
    expect(adminCancelOutcome(unpaid, dayBefore)).toBe('nothing_paid')
  })
  it('tells the customer about the refund, or that the downpayment is kept', () => {
    const withRefund: RehearsalBooking = { ...confirmed, status: 'cancelled', cancelledBy: 'studio', payment: { ...confirmed.payment, refund: { amount: confirmed.downpaymentRequired, status: 'due', sentAt: null, reference: null } } }
    expect(rehearsalNotifications('booking_cancelled', withRefund, '2026-11-16T10:00:00+08:00')[0]!.body).toMatch(/will be returned to you via GCash/)
    const kept: RehearsalBooking = { ...confirmed, status: 'cancelled', cancelledBy: 'studio' }
    expect(rehearsalNotifications('booking_cancelled', kept, '2026-11-16T10:00:00+08:00')[0]!.body).toMatch(/not refunded/)
  })
})
