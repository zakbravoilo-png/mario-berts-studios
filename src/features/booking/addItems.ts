/**
 * Adding rental items to an existing rehearsal booking (user request, 2026-11-20):
 * musicians sometimes forget cables or an instrument, so items can be added later.
 *
 * - Customers can add items until the session starts; studio staff until it ends.
 * - Each item must be free in shared stock (all three rooms) for the booking's whole time.
 * - Added items are charged once, like any rental, and go onto the balance paid after
 *   the rehearsal. The 50% downpayment already set does not change.
 *
 * Pure functions — no storage or React — so they can be unit-tested.
 */
import type { Peso, RehearsalBooking, RentalEquipment, RentalEquipmentId } from '../../types/domain'
import { availableQty, type AvailabilityContext } from './availability'
import { toMs } from '../../utils/time'

export type AddedBy = 'customer' | 'studio'

export interface ItemAddition {
  itemId: RentalEquipmentId
  quantity: number
}

const ACTIVE: RehearsalBooking['status'][] = ['awaiting_payment', 'awaiting_verification', 'confirmed']

/** Why items can't be added right now, or null if they can. */
export function addItemsBlockedReason(b: RehearsalBooking, by: AddedBy, now: number): string | null {
  if (!ACTIVE.includes(b.status)) return 'Items can only be added to an active booking.'
  if (by === 'customer' && now >= toMs(b.startAt)) return 'Your session has started. Ask the studio staff to add items.'
  if (now >= toMs(b.endAt)) return 'This session has ended.'
  return null
}

/** How many more of an item this booking can take (free stock over the booking's time). */
export function addableQty(
  b: RehearsalBooking,
  item: RentalEquipment,
  ctx: Pick<AvailabilityContext, 'bookings' | 'settings' | 'stock'>,
): number {
  if (!item.active || item.outOfService) return 0
  // The booking's own items are already counted as held, so this is exactly what is left.
  return availableQty(item.id, b, ctx)
}

export type AddItemsResult = { ok: true; booking: RehearsalBooking; added: Peso } | { ok: false; errors: string[] }

export function applyAddedItems(
  b: RehearsalBooking,
  additions: ItemAddition[],
  opts: {
    by: AddedBy
    now: number
    at: string
    catalog: RentalEquipment[]
    ctx: Pick<AvailabilityContext, 'bookings' | 'settings' | 'stock'>
  },
): AddItemsResult {
  const blocked = addItemsBlockedReason(b, opts.by, opts.now)
  if (blocked) return { ok: false, errors: [blocked] }

  // Merge repeated items in one request.
  const merged = new Map<RentalEquipmentId, number>()
  for (const a of additions) {
    if (!Number.isInteger(a.quantity) || a.quantity < 0) return { ok: false, errors: ['Quantity must be a whole number.'] }
    if (a.quantity > 0) merged.set(a.itemId, (merged.get(a.itemId) ?? 0) + a.quantity)
  }
  if (merged.size === 0) return { ok: false, errors: ['Choose at least one item to add.'] }

  const errors: string[] = []
  const lines: RehearsalBooking['selectedEquipment'] = []
  for (const [itemId, quantity] of merged) {
    const item = opts.catalog.find((r) => r.id === itemId)
    if (!item) {
      errors.push(`Unknown item: ${itemId}.`)
      continue
    }
    const free = addableQty(b, item, opts.ctx)
    if (quantity > free) {
      errors.push(free === 0 ? `${item.name}: none available at this time.` : `${item.name}: only ${free} available at this time.`)
      continue
    }
    lines.push({ itemId, quantity, unitPrice: item.unitPrice, label: item.name, addedAt: opts.at, addedBy: opts.by })
  }
  if (errors.length) return { ok: false, errors }

  const added = lines.reduce((sum, l) => sum + l.quantity * l.unitPrice, 0)
  return {
    ok: true,
    added,
    booking: {
      ...b,
      selectedEquipment: [...b.selectedEquipment, ...lines],
      equipmentSubtotal: b.equipmentSubtotal + added,
      total: b.total + added,
      balance: b.balance + added,
      // downpaymentRequired and payment.amount stay as they were.
    },
  }
}
