import type { Instructor, WeeklySlot } from '../types/domain'

/**
 * DEMO INSTRUCTORS — obviously fictional placeholders. Real names, what each
 * teaches and their schedules have not been provided by the studio.
 * Covers all six lesson types and both levels; guitar, bass and drums each have
 * two instructors so the choice is meaningful.
 */
const days = (list: number[], start: string, end: string): WeeklySlot[] => list.map((day) => ({ day, start, end }))
const ALL = [0, 1, 2, 3, 4, 5, 6]

export const seedInstructors: Instructor[] = [
  { id: 'inst-1', displayName: 'Demo Instructor 1', instruments: ['drums'], levels: ['beginner', 'intermediate'], weeklyAvailability: days(ALL, '10:00', '18:00'), active: true, isDemo: true },
  { id: 'inst-2', displayName: 'Demo Instructor 2', instruments: ['guitar', 'bass'], levels: ['beginner', 'intermediate'], weeklyAvailability: days([2, 3, 4, 5, 6], '13:00', '21:00'), active: true, isDemo: true },
  { id: 'inst-3', displayName: 'Demo Instructor 3', instruments: ['guitar'], levels: ['beginner'], weeklyAvailability: days([1, 3, 5, 6], '09:00', '15:00'), active: true, isDemo: true },
  { id: 'inst-4', displayName: 'Demo Instructor 4', instruments: ['keyboard', 'piano'], levels: ['beginner', 'intermediate'], weeklyAvailability: days(ALL, '09:00', '17:00'), active: true, isDemo: true },
  { id: 'inst-5', displayName: 'Demo Instructor 5', instruments: ['voice'], levels: ['beginner', 'intermediate'], weeklyAvailability: days([0, 2, 3, 4, 5, 6], '12:00', '20:00'), active: true, isDemo: true },
  { id: 'inst-6', displayName: 'Demo Instructor 6', instruments: ['bass'], levels: ['beginner'], weeklyAvailability: days([0, 6], '09:00', '21:00'), active: true, isDemo: true },
  { id: 'inst-7', displayName: 'Demo Instructor 7', instruments: ['drums'], levels: ['beginner'], weeklyAvailability: days([0, 4, 5, 6], '15:00', '21:00'), active: true, isDemo: true },
]

export const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']
