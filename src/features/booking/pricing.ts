import type { Peso, RentalEquipmentId } from '../../types/domain'
import { defaultSettings } from '../../data/settings'
import { getRental } from '../../data/rentalEquipment'

export interface EquipmentSelection {
  itemId: RentalEquipmentId
  quantity: number
}

export interface PriceLine {
  itemId: RentalEquipmentId
  label: string
  quantity: number
  unitPrice: Peso
  lineTotal: Peso
}

export interface RehearsalPrice {
  hours: number
  roomRate: Peso
  roomSubtotal: Peso
  equipmentLines: PriceLine[]
  equipmentSubtotal: Peso
  total: Peso
  downpayment: Peso
  balance: Peso
}

/**
 * Handoff §5B. Room = hours × rate. Equipment = Σ qty × price, charged ONCE (not hourly).
 * Downpayment = 50% of total; balance = total − downpayment.
 */
export function priceRehearsal(
  hours: number,
  selections: EquipmentSelection[],
  roomRate: Peso = defaultSettings.roomRatePerHour,
  downpaymentRate: number = defaultSettings.downpaymentRate,
): RehearsalPrice {
  if (!Number.isInteger(hours) || hours < 0) throw new Error('Hours must be a whole, non-negative number')
  const equipmentLines: PriceLine[] = selections
    .filter((s) => s.quantity > 0)
    .map((s) => {
      if (!Number.isInteger(s.quantity)) throw new Error('Quantity must be a whole number')
      const item = getRental(s.itemId)
      return {
        itemId: s.itemId,
        label: item.shortName,
        quantity: s.quantity,
        unitPrice: item.unitPrice,
        lineTotal: s.quantity * item.unitPrice,
      }
    })
  const roomSubtotal = hours * roomRate
  const equipmentSubtotal = equipmentLines.reduce((sum, l) => sum + l.lineTotal, 0)
  const total = roomSubtotal + equipmentSubtotal
  const downpayment = Math.round(total * downpaymentRate)
  return {
    hours,
    roomRate,
    roomSubtotal,
    equipmentLines,
    equipmentSubtotal,
    total,
    downpayment,
    balance: total - downpayment,
  }
}

/** Worked example from the handoff (§5B): 970 / 485 / 485. */
export const handoffExample = priceRehearsal(3, [
  { itemId: 'guitar-cable', quantity: 2 },
  { itemId: 'mic-kit', quantity: 1 },
  { itemId: 'keyboard-kit', quantity: 1 },
])
