import type { RentalEquipment } from '../types/domain'

/**
 * Confirmed optional rentals (handoff §3). Prices are charged ONCE per reservation,
 * regardless of hours. Stock is shared across all three rooms.
 */
export const rentalEquipment: RentalEquipment[] = [
  { id: 'guitar-cable', name: 'Guitar cable (mono)', shortName: 'Guitar cable', category: 'cable', unitPrice: 40, totalQuantity: 5, pricingUnit: 'per_item', active: true, outOfService: false },
  { id: 'electric-guitar', name: 'Electric guitar', shortName: 'Electric guitar', category: 'guitar', unitPrice: 100, totalQuantity: 5, pricingUnit: 'per_item', active: true, outOfService: false },
  { id: 'bass-guitar', name: 'Bass guitar (4-string)', shortName: 'Bass (4-string)', category: 'bass', unitPrice: 100, totalQuantity: 3, pricingUnit: 'per_item', active: true, outOfService: false },
  // Added 2026-11-20 (user): one 5-string bass, same price as the 4-string basses.
  { id: 'bass-guitar-5', name: 'Bass guitar (5-string)', shortName: 'Bass (5-string)', category: 'bass', unitPrice: 100, totalQuantity: 1, pricingUnit: 'per_item', active: true, outOfService: false },
  { id: 'acoustic-guitar', name: 'Acoustic guitar', shortName: 'Acoustic guitar', category: 'guitar', unitPrice: 100, totalQuantity: 1, pricingUnit: 'per_item', active: true, outOfService: false },
  { id: 'mic-kit', name: 'Extra microphone + mic cable', shortName: 'Extra mic + cable', category: 'mic', unitPrice: 40, totalQuantity: 5, pricingUnit: 'per_kit', note: 'Rented as one kit (owner to confirm)', active: true, outOfService: false },
  { id: 'keyboard-kit', name: 'Synth / keyboard + cables', shortName: 'Synth / keyboard', category: 'keys', unitPrice: 100, totalQuantity: 2, pricingUnit: 'per_kit', note: 'Rented as one kit (owner to confirm)', active: true, outOfService: false },
  { id: 'extra-guitar-amp', name: 'Extra guitar amplifier', shortName: 'Extra guitar amp', category: 'amp', unitPrice: 80, totalQuantity: 2, pricingUnit: 'per_item', active: true, outOfService: false },
  { id: 'extra-bass-amp', name: 'Extra bass amplifier', shortName: 'Extra bass amp', category: 'amp', unitPrice: 80, totalQuantity: 1, pricingUnit: 'per_item', active: true, outOfService: false },
]

/** Look up an item in the seed catalog (or a given catalog). */
export function getRental(id: RentalEquipment['id'], catalog: RentalEquipment[] = rentalEquipment): RentalEquipment {
  const item = catalog.find((r) => r.id === id)
  if (!item) throw new Error(`Unknown rental item: ${id}`)
  return item
}

/** Display name for a booked item: snapshot label, then catalog, then the id. */
export function equipmentLabel(e: { itemId: string; label?: string }, catalog: RentalEquipment[] = rentalEquipment, short = false): string {
  if (e.label) return e.label
  const item = catalog.find((x) => x.id === e.itemId)
  return item ? (short ? item.shortName : item.name) : e.itemId
}

/** Stock the availability rules should use: removed or out-of-service items count as 0. */
export function stockFromCatalog(catalog: RentalEquipment[]): Record<string, number | null> {
  return Object.fromEntries(catalog.map((r) => [r.id, r.active && !r.outOfService ? r.totalQuantity : 0]))
}
