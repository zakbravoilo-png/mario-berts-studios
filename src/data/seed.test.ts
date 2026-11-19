import { describe, expect, it } from 'vitest'
import { createSeed } from './seed'
import { rooms } from './rooms'
import { stockFromCatalog } from './rentalEquipment'
import { availableQty, rehearsalHolds, validateLessonRequest, validateRehearsalRequest, type AvailabilityContext } from '../features/booking/availability'
import { addDays, manilaIso, todayManila } from '../utils/time'

const NOW = Date.parse('2026-11-16T10:00:00+08:00')
const s = createSeed(NOW)
const ctx: AvailabilityContext = { rooms, bookings: s.bookings, lessons: s.lessons, instructors: s.instructors, settings: s.settings, stock: stockFromCatalog(s.rentals) }

describe('demo seed', () => {
  it('contains no conflicting held bookings', () => {
    for (const b of s.bookings.filter((x) => rehearsalHolds(x, s.settings))) {
      const issues = validateRehearsalRequest({ ...b, equipment: b.selectedEquipment }, ctx, { ignoreId: b.id })
      expect(issues.filter((i) => i.code === 'room_taken' || i.code === 'stock_exceeded')).toEqual([])
    }
  })

  it('contains valid lesson requests', () => {
    for (const l of s.lessons.filter((x) => x.status === 'requested' || x.status === 'confirmed')) {
      expect(validateLessonRequest(l, ctx, { ignoreId: l.id })).toEqual([])
    }
  })

  it('shows the "all mic kits taken" scenario tomorrow 11:00–13:00', () => {
    const d1 = addDays(todayManila(NOW), 1)
    expect(availableQty('mic-kit', { startAt: manilaIso(d1, '11:00'), endAt: manilaIso(d1, '12:00') }, ctx)).toBe(0)
    expect(availableQty('acoustic-guitar', { startAt: manilaIso(d1, '11:00'), endAt: manilaIso(d1, '12:00') }, ctx)).toBe(0)
  })

  it('keeps the pricing example consistent for seeded bookings (50% down, whole pesos)', () => {
    for (const b of s.bookings) {
      expect(b.downpaymentRequired + b.balance).toBe(b.total)
      expect(Number.isInteger(b.downpaymentRequired)).toBe(true)
    }
  })
})
