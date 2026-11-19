import type { BusinessSettings } from '../types/domain'

/**
 * Confirmed: hours 09:00–21:00 Asia/Manila, ₱250/hour/room, 50% downpayment,
 * streaming ₱500/hour, lessons fixed by level (beginner 30 min, intermediate 1 hour).
 * Lesson prices (user, 2026-11-16): beginner ₱500 per 30-minute session, intermediate ₱750 per 1-hour session.
 * DEMO ASSUMPTIONS (owner to confirm): 1-hour rehearsal slots, 1-hour minimum,
 * 30-minute lesson start increments, stock held
 * while awaiting verification, room held while a lesson is requested.
 */
/** Confirmed (user, 2026-11-19): how the remaining 50% is collected. */
export const BALANCE_COLLECTION = 'paid after your rehearsal, in cash at the studio or by GCash'
export const BALANCE_COLLECTION_SHORT = 'after rehearsal · cash or GCash'

export const defaultSettings: BusinessSettings = {
  timezone: 'Asia/Manila',
  openTime: '09:00',
  closeTime: '21:00',
  slotMinutes: 60,
  minBookingHours: 1,
  roomRatePerHour: 250,
  downpaymentRate: 0.5,
  streamingRatePerHour: 500,
  lessonPrices: { beginner: 500, intermediate: 750 },
  lessonDurationMinutes: { beginner: 30, intermediate: 60 },
  lessonSlotMinutes: 30,
  inventoryHoldStatuses: ['awaiting_verification', 'confirmed'],
  lessonRoomHoldStatuses: ['requested', 'confirmed'],
  gcashInstructions: null,
}
