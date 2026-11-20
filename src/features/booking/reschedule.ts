/**
 * Moving a rehearsal booking to another time or room (confirmed by the studio, 2026-11-20:
 * bands can reschedule before the day of the booking).
 *
 * - Customers can reschedule until the end of the day before the booking (Asia/Manila),
 *   the same cut-off as cancelling. Studio staff can still move it on the day, until it starts.
 * - The length stays the same, so the price, downpayment and balance don't change.
 * - The new slot must pass every booking rule: opening hours, a vacant room (rehearsals and
 *   lessons), and enough shared rental stock for the gear already on the booking.
 *
 * Pure functions — no storage or React — so they can be unit-tested.
 */
import type { RehearsalBooking } from '../../types/domain'
import { canCustomerCancel, validateRehearsalRequest, type AvailabilityContext } from './availability'
import { addMinutes, toMs } from '../../utils/time'

export type RescheduledBy = 'customer' | 'studio'

const ACTIVE: RehearsalBooking['status'][] = ['awaiting_payment', 'awaiting_verification', 'confirmed']

/** Why this booking can't be rescheduled right now, or null if it can. */
export function rescheduleBlockedReason(b: RehearsalBooking, by: RescheduledBy, now: number): string | null {
  if (!ACTIVE.includes(b.status)) return 'Only an active booking can be rescheduled.'
  if (by === 'customer' && !canCustomerCancel(b.startAt, now)) {
    return 'Rescheduling is only possible before the day of your booking. On the day, please talk to the studio.'
  }
  if (now >= toMs(b.startAt)) return 'This session has already started.'
  return null
}

export interface RescheduleTarget {
  roomId: string
  startAt: string
}

export type RescheduleResult = { ok: true; booking: RehearsalBooking } | { ok: false; errors: string[] }

export function applyReschedule(
  b: RehearsalBooking,
  target: RescheduleTarget,
  opts: { by: RescheduledBy; now: number; at: string; ctx: AvailabilityContext },
): RescheduleResult {
  const blocked = rescheduleBlockedReason(b, opts.by, opts.now)
  if (blocked) return { ok: false, errors: [blocked] }

  const minutes = (toMs(b.endAt) - toMs(b.startAt)) / 60_000
  const endAt = addMinutes(target.startAt, minutes)
  if (target.roomId === b.roomId && toMs(target.startAt) === toMs(b.startAt)) {
    return { ok: false, errors: ['That is the current time and room. Pick a different time or room.'] }
  }

  // The booking's own slot and gear don't count against the new time.
  const issues = validateRehearsalRequest(
    { roomId: target.roomId, startAt: target.startAt, endAt, equipment: b.selectedEquipment.map((e) => ({ itemId: e.itemId, quantity: e.quantity })) },
    opts.ctx,
    { ignoreId: b.id, now: opts.now },
  )
  if (issues.length) return { ok: false, errors: issues.map((i) => i.message) }

  return {
    ok: true,
    booking: {
      ...b,
      roomId: target.roomId,
      startAt: target.startAt,
      endAt,
      reschedules: [
        ...(b.reschedules ?? []),
        { fromRoomId: b.roomId, fromStartAt: b.startAt, fromEndAt: b.endAt, at: opts.at, by: opts.by },
      ],
    },
  }
}
