import { describe, expect, it } from 'vitest'
import type { RehearsalBooking, RentalEquipmentId } from '../../types/domain'
import { addItemsBlockedReason, applyAddedItems } from './addItems'
import { priceRehearsal } from './pricing'
import { defaultSettings } from '../../data/settings'
import { rentalEquipment, stockFromCatalog } from '../../data/rentalEquipment'
import { manilaIso, toMs } from '../../utils/time'

// 2026-11-21 is a Saturday.
const DAY = '2026-11-21'
const at = (hhmm: string) => manilaIso(DAY, hhmm)
const stock = stockFromCatalog(rentalEquipment)

let seq = 0
/** A booking priced like the real flow (handoff example by default: 970 / 485 / 485). */
function booking(
  roomId: string,
  start: string,
  end: string,
  equipment: [RentalEquipmentId, number][] = [['guitar-cable', 2], ['mic-kit', 1], ['keyboard-kit', 1]],
  status: RehearsalBooking['status'] = 'confirmed',
): RehearsalBooking {
  seq += 1
  const hours = (toMs(at(end)) - toMs(at(start))) / 3_600_000
  const price = priceRehearsal(hours, equipment.map(([itemId, quantity]) => ({ itemId, quantity })))
  return {
    id: `b${seq}`,
    reference: `MBS-TEST-${seq}`,
    customerId: 'c',
    customer: { name: 'Test', email: 't@example.com', phone: '' },
    roomId,
    startAt: at(start),
    endAt: at(end),
    durationHours: hours,
    selectedEquipment: price.equipmentLines.map((l) => ({ itemId: l.itemId, quantity: l.quantity, unitPrice: l.unitPrice })),
    roomSubtotal: price.roomSubtotal,
    equipmentSubtotal: price.equipmentSubtotal,
    total: price.total,
    downpaymentRequired: price.downpayment,
    balance: price.balance,
    payment: { id: 'p', bookingId: 'b', method: 'gcash', amount: price.downpayment, reference: 'X', proofFileName: null, status: 'verified', submittedAt: null, verifiedAt: null },
    status,
    createdAt: at('09:00'),
  }
}

const opts = (bookings: RehearsalBooking[], by: 'customer' | 'studio', now: number) => ({
  by,
  now,
  at: '2026-11-21T14:30:00+08:00',
  catalog: rentalEquipment,
  ctx: { bookings, settings: defaultSettings, stock },
})

describe('adding rental items to a booking', () => {
  it('adds forgotten cables to the balance; the downpayment stays the same', () => {
    const b = booking('room-1', '14:00', '17:00')
    expect([b.total, b.downpaymentRequired, b.balance]).toEqual([970, 485, 485])
    const r = applyAddedItems(b, [{ itemId: 'guitar-cable', quantity: 2 }], opts([b], 'studio', toMs(at('14:30'))))
    expect(r.ok).toBe(true)
    if (!r.ok) return
    expect(r.added).toBe(80)
    expect(r.booking.total).toBe(1050)
    expect(r.booking.equipmentSubtotal).toBe(b.equipmentSubtotal + 80)
    expect(r.booking.downpaymentRequired).toBe(485)
    expect(r.booking.payment.amount).toBe(485)
    expect(r.booking.balance).toBe(565)
    const added = r.booking.selectedEquipment.at(-1)!
    expect(added).toMatchObject({ itemId: 'guitar-cable', quantity: 2, unitPrice: 40, addedBy: 'studio' })
    expect(added.addedAt).toBeDefined()
  })

  it('only allows what is free in shared stock across all rooms', () => {
    // The only 5-string bass is out in Room 2 at the same time.
    const other = booking('room-2', '15:00', '16:00', [['bass-guitar-5', 1]])
    const b = booking('room-1', '14:00', '17:00')
    const r = applyAddedItems(b, [{ itemId: 'bass-guitar-5', quantity: 1 }], opts([b, other], 'studio', toMs(at('14:30'))))
    expect(r.ok).toBe(false)
    if (r.ok) return
    expect(r.errors[0]).toMatch(/none available/)

    // 4-string basses: 3 in stock, 1 already held by this booking → 2 more allowed, not 3.
    const withBass = booking('room-1', '14:00', '17:00', [['bass-guitar', 1]])
    expect(applyAddedItems(withBass, [{ itemId: 'bass-guitar', quantity: 3 }], opts([withBass], 'studio', toMs(at('14:30')))).ok).toBe(false)
    expect(applyAddedItems(withBass, [{ itemId: 'bass-guitar', quantity: 2 }], opts([withBass], 'studio', toMs(at('14:30')))).ok).toBe(true)
  })

  it('customers can add items until the session starts; staff until it ends', () => {
    const b = booking('room-1', '14:00', '17:00')
    expect(addItemsBlockedReason(b, 'customer', toMs(at('13:59')))).toBeNull()
    expect(addItemsBlockedReason(b, 'customer', toMs(at('14:00')))).toMatch(/started/)
    expect(addItemsBlockedReason(b, 'studio', toMs(at('16:59')))).toBeNull()
    expect(addItemsBlockedReason(b, 'studio', toMs(at('17:00')))).toMatch(/ended/)
  })

  it('does not add items to cancelled bookings or empty requests', () => {
    const cancelled = booking('room-1', '14:00', '17:00', [], 'cancelled')
    expect(applyAddedItems(cancelled, [{ itemId: 'guitar-cable', quantity: 1 }], opts([cancelled], 'studio', toMs(at('12:00')))).ok).toBe(false)
    const b = booking('room-1', '14:00', '17:00')
    expect(applyAddedItems(b, [{ itemId: 'guitar-cable', quantity: 0 }], opts([b], 'studio', toMs(at('12:00')))).ok).toBe(false)
  })
})
