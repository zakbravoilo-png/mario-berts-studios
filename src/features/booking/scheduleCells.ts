import type { Room } from '../../types/domain'
import { roomOccupants, type AvailabilityContext, type Occupant } from './availability'
import { hhmmToMinutes, manilaIso, minutesToHhmm, toMs, type DateKey } from '../../utils/time'

export type CellState = 'free' | 'booked' | 'lesson' | 'past'

export interface Cell {
  room: Room
  startMin: number
  state: CellState
  occupants: Occupant[]
}

/** Start times for the day: open → close − slot, every `slotMinutes`. */
export function daySlots(ctx: AvailabilityContext): number[] {
  const open = hhmmToMinutes(ctx.settings.openTime)
  const close = hhmmToMinutes(ctx.settings.closeTime)
  const out: number[] = []
  for (let m = open; m + ctx.settings.slotMinutes <= close; m += ctx.settings.slotMinutes) out.push(m)
  return out
}

export function cellFor(room: Room, date: DateKey, startMin: number, ctx: AvailabilityContext, now: number): Cell {
  const startAt = manilaIso(date, minutesToHhmm(startMin))
  const endAt = manilaIso(date, minutesToHhmm(startMin + ctx.settings.slotMinutes))
  const occupants = roomOccupants(room.id, { startAt, endAt }, ctx)
  let state: CellState = 'free'
  if (occupants.some((o) => o.kind === 'rehearsal')) state = 'booked'
  else if (occupants.length) state = 'lesson'
  else if (toMs(startAt) < now) state = 'past'
  return { room, startMin, state, occupants }
}

