import { describe, expect, it } from 'vitest'
import { priceRehearsal } from './pricing'

describe('priceRehearsal', () => {
  it('matches the handoff example: PHP 970 total, 485 down, 485 balance', () => {
    const p = priceRehearsal(3, [
      { itemId: 'guitar-cable', quantity: 2 },
      { itemId: 'mic-kit', quantity: 1 },
      { itemId: 'keyboard-kit', quantity: 1 },
    ])
    expect(p.roomSubtotal).toBe(750)
    expect(p.equipmentSubtotal).toBe(220)
    expect(p.total).toBe(970)
    expect(p.downpayment).toBe(485)
    expect(p.balance).toBe(485)
  })

  it('charges add-ons once, not per hour', () => {
    const one = priceRehearsal(1, [{ itemId: 'extra-guitar-amp', quantity: 1 }])
    const six = priceRehearsal(6, [{ itemId: 'extra-guitar-amp', quantity: 1 }])
    expect(one.equipmentSubtotal).toBe(80)
    expect(six.equipmentSubtotal).toBe(80)
    expect(six.roomSubtotal).toBe(1500)
  })
})
