import type { Peso, RentalEquipment, RentalEquipmentId } from '../../types/domain'
import { defaultSettings } from '../../data/settings'
import { equipmentLabel, getRental, rentalEquipment } from '../../data/rentalEquipment'

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
  /** Added after the booking was made (billed on the balance). */
  added?: boolean
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
  /** Live catalog (admin-editable prices). Defaults to the confirmed seed prices. */
  catalog: RentalEquipment[] = rentalEquipment,
): RehearsalPrice {
  if (!Number.isInteger(hours) || hours < 0) throw new Error('Hours must be a whole, non-negative number')
  const equipmentLines: PriceLine[] = selections
    .filter((s) => s.quantity > 0)
    .map((s) => {
      if (!Number.isInteger(s.quantity)) throw new Error('Quantity must be a whole number')
      const item = getRental(s.itemId, catalog)
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

/**
 * Receipt for an existing booking, from the prices saved on it — so later price
 * edits in admin never change what a customer already agreed to pay.
 */
export function priceFromBooking(b: {
  durationHours: number
  roomSubtotal: Peso
  equipmentSubtotal: Peso
  total: Peso
  downpaymentRequired: Peso
  balance: Peso
  selectedEquipment: { itemId: RentalEquipmentId; quantity: number; unitPrice: Peso; label?: string; addedAt?: string }[]
}): RehearsalPrice {
  return {
    hours: b.durationHours,
    roomRate: b.durationHours ? b.roomSubtotal / b.durationHours : 0,
    roomSubtotal: b.roomSubtotal,
    equipmentLines: b.selectedEquipment.map((e) => ({
      itemId: e.itemId,
      label: e.label ?? equipmentLabel(e, rentalEquipment, true),
      quantity: e.quantity,
      unitPrice: e.unitPrice,
      lineTotal: e.quantity * e.unitPrice,
      added: Boolean(e.addedAt),
    })),
    equipmentSubtotal: b.equipmentSubtotal,
    total: b.total,
    downpayment: b.downpaymentRequired,
    balance: b.balance,
  }
}
