/**
 * Availability rules (handoff §6). Pure functions — no storage, no React — so they
 * can be unit-tested and later moved behind a real API unchanged.
 *
 * Times are ISO strings with an offset, compared as absolute instants; calendar
 * questions (same day, opening hours, "before the booking day") use Asia/Manila.
 */
import type {
  BusinessSettings,
  Instructor,
  LessonLevel,
  LessonRequest,
  LessonType,
  RehearsalBooking,
  RentalEquipmentId,
  Room,
} from '../../types/domain'
import { dateKeyOf, dayOfWeek, hhmmToMinutes, minutesOfDay, toMs } from '../../utils/time'

export interface TimeRange {
  startAt: string
  endAt: string
}

export type StockMap = Record<RentalEquipmentId, number | null>

/** Everything the rules need to see. */
export interface AvailabilityContext {
  rooms: Room[]
  bookings: RehearsalBooking[]
  lessons: LessonRequest[]
  instructors: Instructor[]
  settings: BusinessSettings
  stock: StockMap
}

/**
 * Standard interval overlap: existing.start < requested.end AND requested.start < existing.end.
 * Adjacent ranges (one ends exactly when the other starts) do not overlap. The studio confirmed
 * (2026-11-20) that no gap is needed between bookings.
 */
export function overlaps(a: TimeRange, b: TimeRange): boolean {
  return toMs(a.startAt) < toMs(b.endAt) && toMs(b.startAt) < toMs(a.endAt)
}

export function rehearsalHolds(b: RehearsalBooking, settings: BusinessSettings): boolean {
  return settings.inventoryHoldStatuses.includes(b.status)
}

export function lessonHolds(l: LessonRequest, settings: BusinessSettings): boolean {
  return settings.lessonRoomHoldStatuses.includes(l.status)
}

/** Inside opening hours on a single Manila calendar day, with a positive length. */
export function withinOperatingHours(range: TimeRange, settings: BusinessSettings): boolean {
  if (toMs(range.endAt) <= toMs(range.startAt)) return false
  if (dateKeyOf(range.startAt) !== dateKeyOf(toMs(range.endAt) - 1)) return false
  const start = minutesOfDay(range.startAt)
  const endDay = dateKeyOf(range.endAt) === dateKeyOf(range.startAt)
  const end = endDay ? minutesOfDay(range.endAt) : 24 * 60
  return start >= hhmmToMinutes(settings.openTime) && end <= hhmmToMinutes(settings.closeTime)
}

export interface Occupant {
  kind: 'rehearsal' | 'lesson'
  id: string
  reference: string
  roomId: string
  startAt: string
  endAt: string
}

/**
 * One source of truth for room use: held rehearsals AND held lessons
 * that overlap `range` in `roomId`. `ignoreId` excludes the item being edited.
 */
export function roomOccupants(
  roomId: string,
  range: TimeRange,
  ctx: Pick<AvailabilityContext, 'bookings' | 'lessons' | 'settings'>,
  ignoreId?: string,
): Occupant[] {
  const out: Occupant[] = []
  for (const b of ctx.bookings) {
    if (b.id === ignoreId || b.roomId !== roomId || !rehearsalHolds(b, ctx.settings)) continue
    if (overlaps(b, range)) out.push({ kind: 'rehearsal', id: b.id, reference: b.reference, roomId, startAt: b.startAt, endAt: b.endAt })
  }
  for (const l of ctx.lessons) {
    if (l.id === ignoreId || l.roomId !== roomId || !lessonHolds(l, ctx.settings)) continue
    if (overlaps(l, range)) out.push({ kind: 'lesson', id: l.id, reference: l.reference, roomId, startAt: l.startAt, endAt: l.endAt })
  }
  return out
}

export function isRoomFree(
  roomId: string,
  range: TimeRange,
  ctx: Pick<AvailabilityContext, 'bookings' | 'lessons' | 'settings'>,
  ignoreId?: string,
): boolean {
  return roomOccupants(roomId, range, ctx, ignoreId).length === 0
}

/** Lowest-numbered active room free for the whole range (lesson auto-assignment). */
export function firstFreeRoom(
  range: TimeRange,
  ctx: Pick<AvailabilityContext, 'rooms' | 'bookings' | 'lessons' | 'settings'>,
  ignoreId?: string,
): Room | null {
  const sorted = [...ctx.rooms].filter((r) => r.active).sort((a, b) => a.number - b.number)
  return sorted.find((r) => isRoomFree(r.id, range, ctx, ignoreId)) ?? null
}

/** Shared stock: total − quantity held by overlapping bookings in any room. */
export function availableQty(
  itemId: RentalEquipmentId,
  range: TimeRange,
  ctx: Pick<AvailabilityContext, 'bookings' | 'settings' | 'stock'>,
  ignoreId?: string,
): number {
  const total = ctx.stock[itemId] ?? 0
  let held = 0
  for (const b of ctx.bookings) {
    if (b.id === ignoreId || !rehearsalHolds(b, ctx.settings) || !overlaps(b, range)) continue
    for (const e of b.selectedEquipment) if (e.itemId === itemId) held += e.quantity
  }
  return Math.max(0, total - held)
}

export interface RehearsalRequest extends TimeRange {
  roomId: string
  equipment: { itemId: RentalEquipmentId; quantity: number }[]
}

export type RehearsalIssueCode = 'invalid_time' | 'outside_hours' | 'too_short' | 'bad_increment' | 'room_taken' | 'stock_exceeded' | 'in_past'

export interface RehearsalIssue {
  code: RehearsalIssueCode
  message: string
  itemId?: RentalEquipmentId
}

/** Every rule a rehearsal request must pass. Empty array = bookable. */
export function validateRehearsalRequest(
  req: RehearsalRequest,
  ctx: AvailabilityContext,
  opts: { ignoreId?: string; now?: number } = {},
): RehearsalIssue[] {
  const issues: RehearsalIssue[] = []
  let startMs: number
  let endMs: number
  try {
    startMs = toMs(req.startAt)
    endMs = toMs(req.endAt)
  } catch {
    return [{ code: 'invalid_time', message: 'The selected time is not valid.' }]
  }
  if (opts.now !== undefined && startMs < opts.now) {
    issues.push({ code: 'in_past', message: 'That start time has already passed.' })
  }
  if (!withinOperatingHours(req, ctx.settings)) {
    issues.push({ code: 'outside_hours', message: `Bookings must start and finish between ${ctx.settings.openTime} and ${ctx.settings.closeTime} (Asia/Manila).` })
  }
  const minutes = (endMs - startMs) / 60_000
  if (minutes < ctx.settings.minBookingHours * 60) {
    issues.push({ code: 'too_short', message: `The minimum booking is ${ctx.settings.minBookingHours} hour(s).` })
  }
  if (minutes % ctx.settings.slotMinutes !== 0 || minutesOfDay(req.startAt) % ctx.settings.slotMinutes !== 0) {
    issues.push({ code: 'bad_increment', message: `Bookings use ${ctx.settings.slotMinutes}-minute increments.` })
  }
  const occupants = roomOccupants(req.roomId, req, ctx, opts.ignoreId)
  if (occupants.length > 0) {
    const what = occupants.some((o) => o.kind === 'lesson') ? 'a lesson' : 'another booking'
    issues.push({ code: 'room_taken', message: `This room is already taken by ${what} during that time.` })
  }
  for (const e of req.equipment) {
    if (e.quantity <= 0) continue
    const free = availableQty(e.itemId, req, ctx, opts.ignoreId)
    if (e.quantity > free) {
      issues.push({ code: 'stock_exceeded', itemId: e.itemId, message: `Only ${free} available for that time (shared across all rooms).` })
    }
  }
  return issues
}

/** Longest whole-hour booking from `startAt` in `roomId`: capped at closing time and the room's next booking. */
export function maxHoursFrom(roomId: string, startAt: string, ctx: AvailabilityContext, ignoreId?: string): number {
  const close = hhmmToMinutes(ctx.settings.closeTime)
  const start = minutesOfDay(startAt)
  const step = ctx.settings.slotMinutes
  let hours = 0
  for (let end = start + step; end <= close; end += step) {
    const range = { startAt, endAt: new Date(toMs(startAt) + (end - start) * 60_000).toISOString() }
    if (!isRoomFree(roomId, range, ctx, ignoreId)) break
    hours = (end - start) / 60
  }
  return hours
}

// ── Lessons ───────────────────────────────────────────────────────────────

export function instructorTeaches(i: Instructor, type: LessonType, level: LessonLevel): boolean {
  return i.active && i.instruments.includes(type) && i.levels.includes(level)
}

/** The whole session sits inside one of the instructor's weekly windows (Manila). */
export function inInstructorSchedule(i: Instructor, range: TimeRange): boolean {
  const day = dayOfWeek(range.startAt)
  if (dateKeyOf(range.startAt) !== dateKeyOf(toMs(range.endAt) - 1)) return false
  const s = minutesOfDay(range.startAt)
  const e = s + (toMs(range.endAt) - toMs(range.startAt)) / 60_000
  return i.weeklyAvailability.some((w) => w.day === day && s >= hhmmToMinutes(w.start) && e <= hhmmToMinutes(w.end))
}

export function instructorFree(
  instructorId: string,
  range: TimeRange,
  ctx: Pick<AvailabilityContext, 'lessons' | 'settings'>,
  ignoreId?: string,
): boolean {
  return !ctx.lessons.some((l) => l.id !== ignoreId && l.instructorId === instructorId && lessonHolds(l, ctx.settings) && overlaps(l, range))
}

/** Instructors who teach this instrument + level, are scheduled for the whole session and have no overlapping held lesson. */
export function availableInstructors(
  type: LessonType,
  level: LessonLevel,
  range: TimeRange,
  ctx: Pick<AvailabilityContext, 'instructors' | 'lessons' | 'settings'>,
  ignoreId?: string,
): Instructor[] {
  return ctx.instructors.filter(
    (i) => instructorTeaches(i, type, level) && inInstructorSchedule(i, range) && instructorFree(i.id, range, ctx, ignoreId),
  )
}

/** A lesson slot is offered only when BOTH an instructor and a room are free. */
export function lessonSlotOpen(
  type: LessonType,
  level: LessonLevel,
  range: TimeRange,
  ctx: AvailabilityContext,
  ignoreId?: string,
): { open: boolean; instructors: Instructor[]; room: Room | null } {
  if (!withinOperatingHours(range, ctx.settings)) return { open: false, instructors: [], room: null }
  const instructors = availableInstructors(type, level, range, ctx, ignoreId)
  const room = firstFreeRoom(range, ctx, ignoreId)
  return { open: instructors.length > 0 && room !== null, instructors, room }
}

export type LessonIssueCode = 'outside_hours' | 'instructor_unavailable' | 'no_room' | 'room_taken' | 'in_past'

export function validateLessonRequest(
  req: TimeRange & { lessonType: LessonType; level: LessonLevel; instructorId: string; roomId: string },
  ctx: AvailabilityContext,
  opts: { ignoreId?: string; now?: number } = {},
): { code: LessonIssueCode; message: string }[] {
  const issues: { code: LessonIssueCode; message: string }[] = []
  if (opts.now !== undefined && toMs(req.startAt) < opts.now) issues.push({ code: 'in_past', message: 'That start time has already passed.' })
  if (!withinOperatingHours(req, ctx.settings)) issues.push({ code: 'outside_hours', message: 'Lessons must fit between opening and closing time.' })
  const ok = availableInstructors(req.lessonType, req.level, req, ctx, opts.ignoreId).some((i) => i.id === req.instructorId)
  if (!ok) issues.push({ code: 'instructor_unavailable', message: 'That instructor is not available for this lesson at that time.' })
  if (!firstFreeRoom(req, ctx, opts.ignoreId)) issues.push({ code: 'no_room', message: 'No studio room is free for the whole session.' })
  else if (!isRoomFree(req.roomId, req, ctx, opts.ignoreId)) issues.push({ code: 'room_taken', message: 'The assigned room is taken at that time.' })
  return issues
}

// ── Cancellation ──────────────────────────────────────────────────────────

/** Confirmed policy: a customer may cancel only BEFORE the booking's calendar day (Asia/Manila). */
export function canCustomerCancel(startAt: string, now: number = Date.now()): boolean {
  return dateKeyOf(now) < dateKeyOf(startAt)
}
