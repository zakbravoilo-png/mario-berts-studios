import { describe, expect, it } from 'vitest'
import { addDays, addMinutes, dateKeyOf, dayOfWeek, formatTime, manilaIso, minutesOfDay } from './time'

describe('Asia/Manila time helpers', () => {
  it('builds +08:00 ISO strings', () => {
    expect(manilaIso('2026-11-21', '09:00')).toBe('2026-11-21T09:00:00+08:00')
  })
  it('reads the Manila date and time regardless of the machine zone', () => {
    // Tests run with TZ=UTC (vite.config.ts).
    expect(dateKeyOf('2026-11-20T23:30:00Z')).toBe('2026-11-21')
    expect(minutesOfDay('2026-11-20T23:30:00Z')).toBe(7 * 60 + 30)
  })
  it('adds minutes and days on the Manila calendar', () => {
    expect(addMinutes('2026-11-21T20:30:00+08:00', 30)).toBe('2026-11-21T21:00:00+08:00')
    expect(addDays('2026-11-30', 1)).toBe('2026-12-01')
  })
  it('knows the day of week in Manila', () => {
    expect(dayOfWeek('2026-11-21')).toBe(6)
  })
  it('formats 12-hour times', () => {
    expect(formatTime('2026-11-21T13:00:00+08:00')).toBe('1:00 PM')
  })
})
