/**
 * Asia/Manila time helpers. Manila is a fixed UTC+8 with no DST, so every
 * timestamp is stored as an ISO string with an explicit "+08:00" offset and all
 * calendar maths is done on that offset — never the browser's local zone.
 */

export const MANILA_OFFSET_MIN = 8 * 60
const MS_MIN = 60_000
const MS_DAY = 86_400_000

/** "YYYY-MM-DD" (a Manila calendar date). */
export type DateKey = string

function pad(n: number): string {
  return String(n).padStart(2, '0')
}

/** Shift an instant so its UTC fields read as Manila wall-clock fields. */
function manilaFields(epochMs: number) {
  const d = new Date(epochMs + MANILA_OFFSET_MIN * MS_MIN)
  return {
    y: d.getUTCFullYear(),
    m: d.getUTCMonth() + 1,
    d: d.getUTCDate(),
    h: d.getUTCHours(),
    min: d.getUTCMinutes(),
    dow: d.getUTCDay(),
  }
}

export function toMs(iso: string): number {
  const t = Date.parse(iso)
  if (Number.isNaN(t)) throw new Error(`Invalid ISO time: ${iso}`)
  return t
}

/** ISO string with +08:00 offset for a Manila date + "HH:MM". */
export function manilaIso(date: DateKey, hhmm: string): string {
  return `${date}T${hhmm}:00+08:00`
}

/** Normalise any instant to a +08:00 ISO string. */
export function toManilaIso(epochMs: number): string {
  const f = manilaFields(epochMs)
  return `${f.y}-${pad(f.m)}-${pad(f.d)}T${pad(f.h)}:${pad(f.min)}:00+08:00`
}

export function addMinutes(iso: string, minutes: number): string {
  return toManilaIso(toMs(iso) + minutes * MS_MIN)
}

/** Manila calendar date of an instant. */
export function dateKeyOf(isoOrMs: string | number): DateKey {
  const f = manilaFields(typeof isoOrMs === 'number' ? isoOrMs : toMs(isoOrMs))
  return `${f.y}-${pad(f.m)}-${pad(f.d)}`
}

/** Minutes since Manila midnight. */
export function minutesOfDay(iso: string): number {
  const f = manilaFields(toMs(iso))
  return f.h * 60 + f.min
}

/** Day of week (0 = Sunday) in Manila. */
export function dayOfWeek(isoOrDate: string): number {
  const iso = isoOrDate.length === 10 ? manilaIso(isoOrDate, '12:00') : isoOrDate
  return manilaFields(toMs(iso)).dow
}

export function todayManila(now: number = Date.now()): DateKey {
  return dateKeyOf(now)
}

export function addDays(date: DateKey, days: number): DateKey {
  return dateKeyOf(toMs(manilaIso(date, '12:00')) + days * MS_DAY)
}

/** "HH:MM" → minutes. */
export function hhmmToMinutes(hhmm: string): number {
  const [h, m] = hhmm.split(':').map(Number)
  return (h ?? 0) * 60 + (m ?? 0)
}

export function minutesToHhmm(min: number): string {
  return `${pad(Math.floor(min / 60))}:${pad(min % 60)}`
}

const dateFmt = new Intl.DateTimeFormat('en-PH', {
  timeZone: 'Asia/Manila',
  weekday: 'short',
  day: 'numeric',
  month: 'short',
  year: 'numeric',
})
const dateFmtLong = new Intl.DateTimeFormat('en-PH', {
  timeZone: 'Asia/Manila',
  weekday: 'long',
  day: 'numeric',
  month: 'long',
  year: 'numeric',
})
const timeFmt = new Intl.DateTimeFormat('en-PH', {
  timeZone: 'Asia/Manila',
  hour: 'numeric',
  minute: '2-digit',
  hour12: true,
})

export function formatDate(isoOrDate: string, long = false): string {
  const iso = isoOrDate.length === 10 ? manilaIso(isoOrDate, '12:00') : isoOrDate
  return (long ? dateFmtLong : dateFmt).format(new Date(toMs(iso)))
}

export function formatTime(iso: string): string {
  return timeFmt.format(new Date(toMs(iso))).replace(/\s?([AP])\.?M\.?/i, ' $1M')
}

/** "9:00 AM – 12:00 PM" */
export function formatRange(startAt: string, endAt: string): string {
  return `${formatTime(startAt)} – ${formatTime(endAt)}`
}

/** "9:00 AM" from minutes-of-day. */
export function formatMinutes(min: number): string {
  const h = Math.floor(min / 60)
  const m = min % 60
  const h12 = ((h + 11) % 12) + 1
  return `${h12}:${pad(m)} ${h < 12 ? 'AM' : 'PM'}`
}

export function formatHours(minutes: number): string {
  if (minutes % 60 === 0) {
    const h = minutes / 60
    return `${h} hr${h === 1 ? '' : 's'}`
  }
  if (minutes < 60) return `${minutes} min`
  return `${Math.floor(minutes / 60)} hr ${minutes % 60} min`
}
