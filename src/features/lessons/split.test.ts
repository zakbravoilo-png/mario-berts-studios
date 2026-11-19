import { describe, expect, it } from 'vitest'
import { instructorPayouts, lessonSplit } from './split'
import type { LessonRequest } from '../../types/domain'

describe('lesson fee split (70% instructor / 30% studio)', () => {
  it('splits the beginner and intermediate fees', () => {
    expect(lessonSplit(500)).toEqual({ price: 500, instructor: 350, studio: 150 })
    expect(lessonSplit(750)).toEqual({ price: 750, instructor: 525, studio: 225 })
  })

  it('always adds back up to the fee', () => {
    for (const p of [1, 99, 333, 501, 749]) {
      const s = lessonSplit(p)
      expect(s.instructor + s.studio).toBe(p)
    }
  })

  it('totals only taught-and-paid lessons per instructor', () => {
    const l = (instructorId: string, status: LessonRequest['status'], sessionPrice: number | null) => ({ instructorId, status, sessionPrice }) as LessonRequest
    const out = instructorPayouts([
      l('inst-1', 'completed', 500),
      l('inst-1', 'completed', 750),
      l('inst-1', 'confirmed', 750),
      l('inst-2', 'cancelled', 500),
      l('inst-2', 'completed', null),
    ])
    expect(out).toEqual([{ instructorId: 'inst-1', lessons: 2, price: 1250, instructor: 875, studio: 375 }])
  })
})
