import { describe, expect, it } from 'vitest'
import type { RehearsalBooking, RentalEquipmentId } from '../../types/domain'
import { applyReschedule, rescheduleBlockedReason } from './reschedule'
import { priceRehearsal } from './pricing'
import type { AvailabilityContext } from './availability'
import { defaultSettings } from '../../data/settings'
import { rooms } from '../../data/rooms'
import { rentalEquipment, stockFromCatalog } from '../../data/rentalEquipment'
import { manilaIso, toMs } from '../../utils/time'

// 2026-11-21 is a Saturday; 2026-11-22 the Sunday after.
const SAT = '2026-11-21'
const SUN = '2026-11-22'
const at = (hhmm: string, day = SAT) => manilaIso(day, hhmm)
const stock = stockFromCatalog(rentalEquipment)

let seq = 0
/** A booking priced like the real flow (handoff example by default: 970 / 485 / 485). */
function booking(
  roomId: string,
  start: string,
  end: string,
  equipment: [RentalEquipmentId, number][] = [['guitar-cable', 2], ['mic-kit', 1], ['keyboard-kit', 1]],
  day = SAT,
  status: RehearsalBooking['status'] = 'confirmed',
): RehearsalBooking {
  seq += 1
  const hours = (toMs(at(end, day)) - toMs(at(start, day))) / 3_600_000
  const price = priceRehearsal(hours, equipment.map(([itemId, quantity]) => ({ itemId, quantity })))
  return {
    id: `b${seq}`,
    reference: `MBS-TEST-${seq}`,
    customerId: 'c',
    customer: { name: 'Test', email: 't@example.com', phone: '' },
    roomId,
    startAt: at(start, day),
    endAt: at(end, day),
    durationHours: hours,
    selectedEquipment: price.equipmentLines.map((l) => ({ itemId: l.itemId, quantity: l.quantity, unitPrice: l.unitPrice })),
    roomSubtotal: price.roomSubtotal,
    equipmentSubtotal: price.equipmentSubtotal,
    total: price.total,
    downpaymentRequired: price.downpayment,
    balance: price.balance,
    payment: { id: 'p', bookingId: 'b', method: 'gcash', amount: price.downpayment, reference: 'X', proofFileName: null, status: 'verified', submittedAt: null, verifiedAt: null },
    status,
    createdAt: at('09:00', '2026-11-18'),
  }
}

const ctx = (bookings: RehearsalBooking[]): AvailabilityContext => ({ rooms, bookings, lessons: [], instructors: [], settings: defaultSettings, stock })
const opts = (bookings: RehearsalBooking[], by: 'customer' | 'studio', now: number) => ({ by, now, at: '2026-11-20T10:00:00+08:00', ctx: ctx(bookings) })
const friday = toMs(manilaIso('2026-11-20', '10:00'))

describe('rescheduling a rehearsal booking', () => {
  it('moves the booking to another day and room; length and price stay the same', () => {
    const b = booking('room-1', '14:00', '17:00')
    const r = applyReschedule(b, { roomId: 'room-2', startAt: at('18:00', SUN) }, opts([b], 'customer', friday))
    expect(r.ok).toBe(true)
    if (!r.ok) return
    expect(r.booking.roomId).toBe('room-2')
    expect(r.booking.startAt).toBe(at('18:00', SUN))
    expect(toMs(r.booking.endAt)).toBe(toMs(at('21:00', SUN)))
    expect([r.booking.total, r.booking.downpaymentRequired, r.booking.balance]).toEqual([970, 485, 485])
    expect(r.booking.reschedules).toEqual([{ fromRoomId: 'room-1', fromStartAt: b.startAt, fromEndAt: b.endAt, at: '2026-11-20T10:00:00+08:00', by: 'customer' }])
  })

  it('customers can reschedule before the booking day; staff until the session starts', () => {
    const b = booking('room-1', '14:00', '17:00')
    expect(rescheduleBlockedReason(b, 'customer', toMs(manilaIso('2026-11-20', '23:59')))).toBeNull()
    expect(rescheduleBlockedReason(b, 'customer', toMs(at('08:00')))).toMatch(/before the day/)
    expect(rescheduleBlockedReason(b, 'studio', toMs(at('13:59')))).toBeNull()
    expect(rescheduleBlockedReason(b, 'studio', toMs(at('14:00')))).toMatch(/started/)
    expect(rescheduleBlockedReason(booking('room-1', '14:00', '17:00', [], SAT, 'cancelled'), 'studio', friday)).toMatch(/active/)
  })

  it('refuses a room that is taken, ignoring the booking’s own slot', () => {
    const b = booking('room-1', '14:00', '17:00')
    const other = booking('room-2', '15:00', '16:00', [])
    const taken = applyReschedule(b, { roomId: 'room-2', startAt: at('14:00') }, opts([b, other], 'customer', friday))
    expect(taken.ok).toBe(false)
    // Moving one hour later in the same room overlaps only itself, so it is fine.
    expect(applyReschedule(b, { roomId: 'room-1', startAt: at('15:00') }, opts([b, other], 'customer', friday)).ok).toBe(true)
  })

  it('refuses a time when the booking’s gear is out in another room', () => {
    // The only 5-string bass is booked in Room 2 on Sunday afternoon.
    const b = booking('room-1', '14:00', '17:00', [['bass-guitar-5', 1]])
    const other = booking('room-2', '14:00', '16:00', [['bass-guitar-5', 1]], SUN)
    const r = applyReschedule(b, { roomId: 'room-3', startAt: at('13:00', SUN) }, opts([b, other], 'customer', friday))
    expect(r.ok).toBe(false)
    if (r.ok) return
    expect(r.errors.join(' ')).toMatch(/available/)
    expect(applyReschedule(b, { roomId: 'room-3', startAt: at('16:00', SUN) }, opts([b, other], 'customer', friday)).ok).toBe(true)
  })

  it('refuses the same slot, closing time and times already past', () => {
    const b = booking('room-1', '14:00', '17:00')
    expect(applyReschedule(b, { roomId: 'room-1', startAt: at('14:00') }, opts([b], 'customer', friday)).ok).toBe(false)
    expect(applyReschedule(b, { roomId: 'room-1', startAt: at('19:00', SUN) }, opts([b], 'customer', friday)).ok).toBe(false)
    expect(applyReschedule(b, { roomId: 'room-1', startAt: manilaIso('2026-11-20', '09:00') }, opts([b], 'customer', friday)).ok).toBe(false)
  })
})

describe('reschedule message', () => {
  it('tells the customer the new and old time, with the price unchanged', async () => {
    const { rehearsalNotifications } = await import('../../services/notifications')
    const b = booking('room-1', '14:00', '17:00')
    const r = applyReschedule(b, { roomId: 'room-2', startAt: at('18:00', SUN) }, opts([b], 'studio', friday))
    if (!r.ok) throw new Error(r.errors.join(' '))
    const withPhone = { ...r.booking, customer: { ...r.booking.customer, phone: '0900 000 0000' } }
    const msgs = rehearsalNotifications('booking_rescheduled', withPhone, '2026-11-20T10:00:00+08:00')
    const sms = msgs.find((m) => m.channel === 'sms')!.body
    const email = msgs.find((m) => m.channel === 'email')!.body
    expect(sms).toMatch(/moved to Room 2/)
    expect(sms).toMatch(/was Room 1/)
    expect(sms).toMatch(/unchanged/)
    expect(email).toMatch(/New: .*Room 2/)
    expect(email).toMatch(/Was: Room 1/)
  })
})
