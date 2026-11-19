import type { RentalEquipment } from '../types/domain'

/**
 * Confirmed optional rentals (handoff §3). Prices are charged ONCE per reservation,
 * regardless of hours. Stock is shared across all three rooms.
 */
export const rentalEquipment: RentalEquipment[] = [
  { id: 'guitar-cable', name: 'Guitar cable (mono)', shortName: 'Guitar cable', category: 'cable', unitPrice: 40, totalQuantity: 5, pricingUnit: 'per_item', active: true },
  { id: 'electric-guitar', name: 'Electric guitar', shortName: 'Electric guitar', category: 'guitar', unitPrice: 100, totalQuantity: 5, pricingUnit: 'per_item', active: true },
  { id: 'bass-guitar', name: 'Bass guitar', shortName: 'Bass guitar', category: 'bass', unitPrice: 100, totalQuantity: 3, pricingUnit: 'per_item', active: true },
  { id: 'acoustic-guitar', name: 'Acoustic guitar', shortName: 'Acoustic guitar', category: 'guitar', unitPrice: 100, totalQuantity: 1, pricingUnit: 'per_item', active: true },
  { id: 'mic-kit', name: 'Extra microphone + mic cable', shortName: 'Extra mic + cable', category: 'mic', unitPrice: 40, totalQuantity: 5, pricingUnit: 'per_kit', note: 'Rented as one kit (owner to confirm)', active: true },
  { id: 'keyboard-kit', name: 'Synth / keyboard + cables', shortName: 'Synth / keyboard', category: 'keys', unitPrice: 100, totalQuantity: 2, pricingUnit: 'per_kit', note: 'Rented as one kit (owner to confirm)', active: true },
  { id: 'extra-guitar-amp', name: 'Extra guitar amplifier', shortName: 'Extra guitar amp', category: 'amp', unitPrice: 80, totalQuantity: 2, pricingUnit: 'per_item', active: true },
  { id: 'extra-bass-amp', name: 'Extra bass amplifier', shortName: 'Extra bass amp', category: 'amp', unitPrice: 80, totalQuantity: 1, pricingUnit: 'per_item', active: true },
]

export function getRental(id: RentalEquipment['id']): RentalEquipment {
  const item = rentalEquipment.find((r) => r.id === id)
  if (!item) throw new Error(`Unknown rental item: ${id}`)
  return item
}
