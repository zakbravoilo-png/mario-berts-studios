import { describe, expect, it } from 'vitest'
import type { Instructor, LessonRequest, RehearsalBooking, RentalEquipmentId } from '../../types/domain'
import {
  availableInstructors,
  availableQty,
  canCustomerCancel,
  firstFreeRoom,
  lessonSlotOpen,
  maxHoursFrom,
  overlaps,
  validateLessonRequest,
  validateRehearsalRequest,
  withinOperatingHours,
  type AvailabilityContext,
} from './availability'
import { defaultSettings } from '../../data/settings'
import { rooms } from '../../data/rooms'
import { rentalEquipment } from '../../data/rentalEquipment'
import { addMinutes, manilaIso, toMs } from '../../utils/time'

// 2026-11-21 is a Saturday.
const DAY = '2026-11-21'
const at = (hhmm: string, day = DAY) => manilaIso(day, hhmm)

const stock = Object.fromEntries(rentalEquipment.map((r) => [r.id, r.totalQuantity])) as AvailabilityContext['stock']

let seq = 0
function booking(roomId: string, start: string, end: string, equipment: [RentalEquipmentId, number][] = [], status: RehearsalBooking['status'] = 'confirmed'): RehearsalBooking {
  seq += 1
  return {
    id: `b${seq}`,
    reference: `MBS-TEST-${seq}`,
    customerId: 'c',
    customer: { name: 'Test', email: 't@example.com', phone: '' },
    roomId,
    startAt: at(start),
    endAt: at(end),
    durationHours: 1,
    selectedEquipment: equipment.map(([itemId, quantity]) => ({ itemId, quantity, unitPrice: 0 })),
    roomSubtotal: 0,
    equipmentSubtotal: 0,
    total: 0,
    downpaymentRequired: 0,
    balance: 0,
    payment: { id: 'p', bookingId: 'b', method: 'gcash', amount: 0, reference: null, proofFileName: null, status: 'submitted', submittedAt: null, verifiedAt: null },
    status,
    createdAt: at('09:00'),
  }
}

function lesson(roomId: string, instructorId: string, start: string, minutes: number, status: LessonRequest['status'] = 'confirmed'): LessonRequest {
  seq += 1
  return {
    id: `l${seq}`,
    reference: `MBL-TEST-${seq}`,
    customerId: 'c',
    customer: { name: 'Test', email: 't@example.com', phone: '' },
    lessonType: 'guitar',
    level: 'beginner',
    instructorId,
    roomId,
    startAt: at(start),
    endAt: addMinutes(at(start), minutes),
    durationMinutes: minutes,
    sessionPrice: 500,
    status,
    createdAt: at('09:00'),
  }
}

const allDay = [0, 1, 2, 3, 4, 5, 6].map((day) => ({ day, start: '09:00', end: '21:00' }))
const instructors: Instructor[] = [
  { id: 'g1', displayName: 'Demo Instructor A', instruments: ['guitar'], levels: ['beginner', 'intermediate'], weeklyAvailability: allDay, active: true, isDemo: true },
  { id: 'g2', displayName: 'Demo Instructor B', instruments: ['guitar'], levels: ['beginner'], weeklyAvailability: [{ day: 6, start: '13:00', end: '17:00' }], active: true, isDemo: true },
  { id: 'p1', displayName: 'Demo Instructor C', instruments: ['piano'], levels: ['intermediate'], weeklyAvailability: allDay, active: true, isDemo: true },
]

function ctx(bookings: RehearsalBooking[] = [], lessons: LessonRequest[] = []): AvailabilityContext {
  return { rooms, bookings, lessons, instructors, settings: defaultSettings, stock }
}

const req = (roomId: string, start: string, end: string, equipment: [RentalEquipmentId, number][] = []) => ({
  roomId,
  startAt: at(start),
  endAt: at(end),
  equipment: equipment.map(([itemId, quantity]) => ({ itemId, quantity })),
})
const codes = (issues: { code: string }[]) => issues.map((i) => i.code)

describe('overlaps', () => {
  it('detects overlapping ranges', () => {
    expect(overlaps({ startAt: at('10:00'), endAt: at('12:00') }, { startAt: at('11:00'), endAt: at('13:00') })).toBe(true)
  })
  it('treats adjacent ranges as non-overlapping', () => {
    expect(overlaps({ startAt: at('10:00'), endAt: at('11:00') }, { startAt: at('11:00'), endAt: at('12:00') })).toBe(false)
  })
  it('compares instants, not wall-clock strings, across offsets', () => {
    // 02:00Z is 10:00 in Manila.
    expect(overlaps({ startAt: '2026-11-21T02:00:00Z', endAt: '2026-11-21T02:30:00Z' }, { startAt: at('10:00'), endAt: at('11:00') })).toBe(true)
  })
})

describe('room conflicts', () => {
  it('rejects a same-room overlap', () => {
    const c = ctx([booking('room-1', '10:00', '12:00')])
    expect(codes(validateRehearsalRequest(req('room-1', '11:00', '13:00'), c))).toContain('room_taken')
  })
  it('allows adjacent bookings in the same room', () => {
    const c = ctx([booking('room-1', '10:00', '12:00')])
    expect(validateRehearsalRequest(req('room-1', '12:00', '14:00'), c)).toEqual([])
  })
  it('allows the same time in a different room', () => {
    const c = ctx([booking('room-1', '10:00', '12:00')])
    expect(validateRehearsalRequest(req('room-2', '10:00', '12:00'), c)).toEqual([])
  })
  it('ignores bookings that do not hold the room (awaiting payment, cancelled, rejected)', () => {
    const c = ctx([
      booking('room-1', '10:00', '12:00', [], 'awaiting_payment'),
      booking('room-1', '10:00', '12:00', [], 'cancelled'),
      booking('room-1', '10:00', '12:00', [], 'rejected'),
    ])
    expect(validateRehearsalRequest(req('room-1', '10:00', '12:00'), c)).toEqual([])
  })
  it('holds the room while awaiting verification (default setting)', () => {
    const c = ctx([booking('room-1', '10:00', '12:00', [], 'awaiting_verification')])
    expect(codes(validateRehearsalRequest(req('room-1', '11:00', '12:00'), c))).toContain('room_taken')
  })
  it('rejects a rehearsal over a lesson in that room', () => {
    const c = ctx([], [lesson('room-2', 'g1', '14:00', 60)])
    expect(codes(validateRehearsalRequest(req('room-2', '13:00', '15:00'), c))).toContain('room_taken')
  })
  it('a 30-minute beginner lesson blocks the overlapping 1-hour rehearsal slot', () => {
    const c = ctx([], [lesson('room-3', 'g1', '10:00', defaultSettings.lessonDurationMinutes.beginner)])
    expect(codes(validateRehearsalRequest(req('room-3', '10:00', '11:00'), c))).toContain('room_taken')
    expect(validateRehearsalRequest(req('room-3', '11:00', '12:00'), c)).toEqual([])
  })
  it('a 10:30–11:00 lesson also blocks the 10:00–11:00 rehearsal hour', () => {
    const c = ctx([], [lesson('room-3', 'g1', '10:30', 30)])
    expect(codes(validateRehearsalRequest(req('room-3', '10:00', '11:00'), c))).toContain('room_taken')
  })
  it('caps the duration at closing time and at the next booking', () => {
    const c = ctx([booking('room-1', '15:00', '17:00')])
    expect(maxHoursFrom('room-1', at('12:00'), c)).toBe(3)
    expect(maxHoursFrom('room-2', at('18:00'), c)).toBe(3)
  })
})

describe('operating hours (09:00–21:00 Asia/Manila)', () => {
  it('accepts a booking inside hours', () => {
    expect(withinOperatingHours({ startAt: at('09:00'), endAt: at('21:00') }, defaultSettings)).toBe(true)
  })
  it('rejects a booking starting before 9 AM', () => {
    expect(codes(validateRehearsalRequest(req('room-1', '08:00', '10:00'), ctx()))).toContain('outside_hours')
  })
  it('rejects a booking ending after 9 PM', () => {
    expect(codes(validateRehearsalRequest(req('room-1', '20:00', '22:00'), ctx()))).toContain('outside_hours')
  })
  it('judges hours in Manila even when given a UTC timestamp', () => {
    // 00:30Z = 08:30 Manila → before opening.
    expect(withinOperatingHours({ startAt: '2026-11-21T00:30:00Z', endAt: '2026-11-21T02:00:00Z' }, defaultSettings)).toBe(false)
  })
})

describe('shared rental stock', () => {
  it('rejects mic over-allocation across overlapping bookings in different rooms', () => {
    const c = ctx([booking('room-1', '10:00', '13:00', [['mic-kit', 3]]), booking('room-2', '11:00', '13:00', [['mic-kit', 2]])])
    expect(availableQty('mic-kit', { startAt: at('11:00'), endAt: at('12:00') }, c)).toBe(0)
    const issues = validateRehearsalRequest(req('room-3', '11:00', '12:00', [['mic-kit', 1]]), c)
    expect(codes(issues)).toEqual(['stock_exceeded'])
  })
  it('counts only overlapping bookings', () => {
    const c = ctx([booking('room-1', '10:00', '13:00', [['mic-kit', 5]])])
    expect(availableQty('mic-kit', { startAt: at('13:00'), endAt: at('14:00') }, c)).toBe(5)
  })
  it('rejects a second acoustic guitar when overlapping (stock 1)', () => {
    const c = ctx([booking('room-1', '10:00', '12:00', [['acoustic-guitar', 1]])])
    expect(codes(validateRehearsalRequest(req('room-2', '11:00', '12:00', [['acoustic-guitar', 1]]), c))).toContain('stock_exceeded')
  })
  it('rejects a second extra bass amp when overlapping (stock 1)', () => {
    const c = ctx([booking('room-2', '10:00', '12:00', [['extra-bass-amp', 1]])])
    expect(codes(validateRehearsalRequest(req('room-3', '10:00', '11:00', [['extra-bass-amp', 1]]), c))).toContain('stock_exceeded')
  })
  it('allows both extra guitar amps (stock 2) but not a third', () => {
    const c = ctx([booking('room-1', '10:00', '12:00', [['extra-guitar-amp', 1]])])
    expect(validateRehearsalRequest(req('room-2', '10:00', '11:00', [['extra-guitar-amp', 1]]), c)).toEqual([])
    expect(codes(validateRehearsalRequest(req('room-2', '10:00', '11:00', [['extra-guitar-amp', 2]]), c))).toContain('stock_exceeded')
  })
})

describe('lessons and instructors', () => {
  const range = (start: string, minutes: number) => ({ startAt: at(start), endAt: addMinutes(at(start), minutes) })

  it('lists only instructors who teach that instrument and level', () => {
    expect(availableInstructors('guitar', 'intermediate', range('10:00', 60), ctx()).map((i) => i.id)).toEqual(['g1'])
    expect(availableInstructors('piano', 'beginner', range('10:00', 30), ctx())).toEqual([])
  })
  it('excludes instructors outside their weekly schedule', () => {
    expect(availableInstructors('guitar', 'beginner', range('10:00', 30), ctx()).map((i) => i.id)).toEqual(['g1'])
    expect(availableInstructors('guitar', 'beginner', range('14:00', 30), ctx()).map((i) => i.id)).toEqual(['g1', 'g2'])
    expect(availableInstructors('guitar', 'beginner', range('16:45', 30), ctx()).map((i) => i.id)).toEqual(['g1'])
  })
  it('prevents instructor double-booking', () => {
    const c = ctx([], [lesson('room-1', 'g1', '14:00', 60)])
    expect(availableInstructors('guitar', 'beginner', range('14:30', 30), c).map((i) => i.id)).toEqual(['g2'])
    const issues = validateLessonRequest({ ...range('14:30', 30), lessonType: 'guitar', level: 'beginner', instructorId: 'g1', roomId: 'room-2' }, c)
    expect(codes(issues)).toContain('instructor_unavailable')
  })
  it('auto-assigns the lowest-numbered free room', () => {
    const c = ctx([booking('room-1', '10:00', '12:00')])
    expect(firstFreeRoom(range('10:00', 30), c)?.id).toBe('room-2')
  })
  it('rejects a lesson when all three rooms are busy', () => {
    const c = ctx([booking('room-1', '10:00', '12:00'), booking('room-2', '10:00', '12:00')], [lesson('room-3', 'p1', '10:00', 60)])
    const slot = lessonSlotOpen('guitar', 'beginner', range('10:30', 30), c)
    expect(slot.room).toBeNull()
    expect(slot.open).toBe(false)
    const issues = validateLessonRequest({ ...range('10:30', 30), lessonType: 'guitar', level: 'beginner', instructorId: 'g1', roomId: 'room-3' }, c)
    expect(codes(issues)).toContain('no_room')
  })
  it('offers a slot only when both an instructor and a room are free', () => {
    expect(lessonSlotOpen('guitar', 'beginner', range('10:00', 30), ctx()).open).toBe(true)
    expect(lessonSlotOpen('piano', 'beginner', range('10:00', 30), ctx()).open).toBe(false)
  })
})

describe('customer cancellation (before the booking day, Asia/Manila)', () => {
  const start = at('18:00')
  it('is allowed the day before', () => {
    expect(canCustomerCancel(start, toMs(manilaIso('2026-11-20', '23:59')))).toBe(true)
  })
  it('is refused on the booking day', () => {
    expect(canCustomerCancel(start, toMs(at('00:01')))).toBe(false)
    expect(canCustomerCancel(start, toMs(at('17:00')))).toBe(false)
  })
  it('applies the same rule to lessons: up to the day before, not on the lesson day', () => {
    const lesson = at('10:00') // a 30-minute beginner lesson
    expect(canCustomerCancel(lesson, toMs(manilaIso('2026-11-20', '21:00')))).toBe(true)
    expect(canCustomerCancel(lesson, toMs(at('08:00')))).toBe(false)
  })
  it('uses the Manila calendar, not UTC (UTC is still the previous day at 07:00 Manila)', () => {
    // 2026-11-20T23:30Z = 2026-11-21 07:30 Manila → booking day → refused.
    expect(canCustomerCancel(start, Date.parse('2026-11-20T23:30:00Z'))).toBe(false)
  })
})
