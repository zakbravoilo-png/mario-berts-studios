import { describe, expect, it } from 'vitest'
import { rentalEquipment, stockFromCatalog, equipmentLabel } from '../../data/rentalEquipment'
import { priceFromBooking, priceRehearsal } from '../booking/pricing'
import { availableQty } from '../booking/availability'
import { defaultSettings } from '../../data/settings'
import type { RentalEquipment } from '../../types/domain'

const catalog = (patch: (r: RentalEquipment) => RentalEquipment): RentalEquipment[] => rentalEquipment.map((r) => patch({ ...r }))
const range = { startAt: '2026-11-21T10:00:00+08:00', endAt: '2026-11-21T11:00:00+08:00' }

describe('editable rental catalog', () => {
  it('prices new bookings from the live catalog', () => {
    const live = catalog((r) => (r.id === 'guitar-cable' ? { ...r, unitPrice: 50 } : r))
    expect(priceRehearsal(1, [{ itemId: 'guitar-cable', quantity: 2 }], 250, 0.5, live).equipmentSubtotal).toBe(100)
  })

  it('keeps the confirmed default prices when no catalog is given (970 / 485 / 485)', () => {
    const p = priceRehearsal(3, [{ itemId: 'guitar-cable', quantity: 2 }, { itemId: 'mic-kit', quantity: 1 }, { itemId: 'keyboard-kit', quantity: 1 }])
    expect([p.total, p.downpayment, p.balance]).toEqual([970, 485, 485])
  })

  it('shows existing bookings at the price they were booked at, not the new price', () => {
    const booked = { durationHours: 1, roomSubtotal: 250, equipmentSubtotal: 80, total: 330, downpaymentRequired: 165, balance: 165, selectedEquipment: [{ itemId: 'guitar-cable', quantity: 2, unitPrice: 40, label: 'Guitar cable (mono)' }] }
    const p = priceFromBooking(booked)
    expect(p.equipmentLines[0]).toMatchObject({ unitPrice: 40, lineTotal: 80, label: 'Guitar cable (mono)' })
    expect(p.total).toBe(330)
  })

  it('treats out-of-service and removed items as 0 available', () => {
    const live = catalog((r) => (r.id === 'mic-kit' ? { ...r, outOfService: true } : r.id === 'keyboard-kit' ? { ...r, active: false } : r))
    const stock = stockFromCatalog(live)
    const ctx = { bookings: [], settings: defaultSettings, stock }
    expect(availableQty('mic-kit', range, ctx)).toBe(0)
    expect(availableQty('keyboard-kit', range, ctx)).toBe(0)
    expect(availableQty('guitar-cable', range, ctx)).toBe(5)
  })

  it('labels booked items from the saved name first', () => {
    expect(equipmentLabel({ itemId: 'gone-item', label: 'Cowbell' })).toBe('Cowbell')
    expect(equipmentLabel({ itemId: 'mic-kit' }, rentalEquipment, true)).toBe('Extra mic + cable')
  })
})
