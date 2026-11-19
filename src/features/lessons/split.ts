import type { LessonRequest, Peso } from '../../types/domain'

/**
 * Confirmed (user, 2026-11-19): each lesson fee is split 70% to the instructor and
 * 30% to the studio. Customers pay the full lesson fee on the day, at the studio.
 */
export const INSTRUCTOR_SHARE = 0.7

export interface LessonSplit {
  price: Peso
  instructor: Peso
  studio: Peso
}

/** Splits one lesson fee. Whole pesos; any rounding goes to the studio so the parts always add up. */
export function lessonSplit(price: Peso): LessonSplit {
  const instructor = Math.round(price * INSTRUCTOR_SHARE)
  return { price, instructor, studio: price - instructor }
}

export interface InstructorPayout extends LessonSplit {
  instructorId: string
  lessons: number
}

/** Totals per instructor for lessons that were taught and paid (status "completed"). */
export function instructorPayouts(lessons: readonly LessonRequest[]): InstructorPayout[] {
  const byId = new Map<string, InstructorPayout>()
  for (const l of lessons) {
    if (l.status !== 'completed' || l.sessionPrice === null) continue
    const sp = lessonSplit(l.sessionPrice)
    const cur = byId.get(l.instructorId) ?? { instructorId: l.instructorId, lessons: 0, price: 0, instructor: 0, studio: 0 }
    byId.set(l.instructorId, {
      ...cur,
      lessons: cur.lessons + 1,
      price: cur.price + sp.price,
      instructor: cur.instructor + sp.instructor,
      studio: cur.studio + sp.studio,
    })
  }
  return [...byId.values()].sort((a, b) => a.instructorId.localeCompare(b.instructorId))
}
