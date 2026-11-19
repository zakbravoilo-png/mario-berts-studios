import { describe, expect, it } from 'vitest'
import { rehearsalNotifications } from './notifications'
import { createSeed } from '../data/seed'
import { normalizePhone, validateCustomer } from '../features/booking/customerSchema'

const NOW = Date.parse('2026-11-16T10:00:00+08:00')
const booking = createSeed(NOW).bookings.find((b) => b.status === 'confirmed')!

describe('booking confirmations (simulated SMS + email)', () => {
  it('sends an SMS to the contact number and an email when one is given', () => {
    const msgs = rehearsalNotifications('booking_confirmed', booking, '2026-11-16T10:00:00+08:00')
    expect(msgs.map((m) => m.channel)).toEqual(['sms', 'email'])
    expect(msgs[0]!.to).toBe(booking.customer.phone)
    expect(msgs[1]!.to).toBe(booking.customer.email)
    expect(msgs.every((m) => m.status === 'simulated')).toBe(true)
    expect(msgs[0]!.body).toContain(booking.reference)
    expect(msgs[0]!.body).toContain('CONFIRMED')
  })

  it('skips email when the customer gave none', () => {
    const msgs = rehearsalNotifications('payment_submitted', { ...booking, customer: { ...booking.customer, email: '' } }, '2026-11-16T10:00:00+08:00')
    expect(msgs.map((m) => m.channel)).toEqual(['sms'])
    expect(msgs[0]!.body).toMatch(/not confirmed/i)
  })

  it('explains the refund-before-the-day rule when payment is submitted', () => {
    const [sms] = rehearsalNotifications('payment_submitted', booking, '2026-11-16T10:00:00+08:00')
    expect(sms!.body).toMatch(/before the booking day/)
  })

  it('says the balance is paid after the rehearsal, by cash or GCash', () => {
    const [sms, email] = rehearsalNotifications('booking_confirmed', booking, '2026-11-16T10:00:00+08:00')
    expect(sms!.body).toMatch(/after your rehearsal/)
    expect(email!.body).toMatch(/after your rehearsal, in cash at the studio or by GCash/)
  })
})

describe('guest contact details', () => {
  const base = { name: 'Jun', phone: '0917 123 4567', email: '', bandName: '', notes: '' }
  it('requires a name or nickname and a contact number; email is optional', () => {
    expect(validateCustomer(base)).toEqual({})
    expect(validateCustomer({ ...base, name: ' ' }).name).toBeTruthy()
    expect(validateCustomer({ ...base, phone: '' }).phone).toBeTruthy()
  })
  it('validates email only when one is given', () => {
    expect(validateCustomer({ ...base, email: 'nope' }).email).toBeTruthy()
    expect(validateCustomer({ ...base, email: 'jun@example.com' })).toEqual({})
  })
  it('matches +63 and 0-prefixed Philippine mobile numbers', () => {
    expect(normalizePhone('+63 917 123 4567')).toBe(normalizePhone('0917-123-4567'))
  })
})
