import { describe, expect, it } from 'vitest'
import { ADMIN_EMAILS, checkAdminCredentials, checkCode, CODE_TTL_MS, DEMO_ADMIN_PASSWORD, MAX_ATTEMPTS, newChallenge, normalizeTarget } from './session'
import { ownsRecord, findCustomerByPhone } from './accounts'
import type { Customer } from '../types/domain'

describe('demo one-time codes', () => {
  const target = normalizeTarget('phone', '0917 123 4567')
  const ch = newChallenge(target, 1_000)

  it('creates a 6-digit code', () => {
    expect(ch.code).toMatch(/^\d{6}$/)
  })
  it('accepts the right code for the same target (spaces ignored)', () => {
    expect(checkCode(ch, target, `${ch.code.slice(0, 3)} ${ch.code.slice(3)}`, 2_000)).toBe('ok')
  })
  it('treats +63 and 0 prefixes as the same number', () => {
    expect(normalizeTarget('phone', '+63 917 123 4567')).toBe(target)
  })
  it('rejects a wrong code, another target, an expired code and too many tries', () => {
    const wrong = ch.code === '000000' ? '111111' : '000000'
    expect(checkCode(ch, target, wrong, 2_000)).toBe('wrong')
    expect(checkCode(ch, normalizeTarget('phone', '0918 000 0000'), ch.code, 2_000)).toBe('mismatch')
    expect(checkCode(ch, target, ch.code, 1_000 + CODE_TTL_MS + 1)).toBe('expired')
    expect(checkCode({ ...ch, attempts: MAX_ATTEMPTS }, target, ch.code, 2_000)).toBe('locked')
    expect(checkCode(null, target, ch.code, 2_000)).toBe('mismatch')
  })
  it('allows only the studio email into the demo admin', () => {
    expect(ADMIN_EMAILS).toEqual(['mario.bertstudios@gmail.com'])
  })
})

describe('customer ownership', () => {
  const me: Customer = { id: 'c1', name: 'Jun', phone: '0917 123 4567', email: '', isDemo: true }
  const details = (phone: string) => ({ name: 'x', email: '', phone })

  it('owns records made in the account', () => {
    expect(ownsRecord(me, { customerId: 'c1', customer: details('0000') })).toBe(true)
  })
  it('owns guest records made with the same contact number', () => {
    expect(ownsRecord(me, { customerId: 'guest', customer: details('+63 917 123 4567') })).toBe(true)
  })
  it("does not own other people's records", () => {
    expect(ownsRecord(me, { customerId: 'guest', customer: details('0918 000 0000') })).toBe(false)
    expect(ownsRecord(me, { customerId: 'c2', customer: details('0917 123 4567') })).toBe(false)
  })
  it('finds an account by contact number in any format', () => {
    expect(findCustomerByPhone([me], '+639171234567')?.id).toBe('c1')
  })
})

describe('demo admin email + password', () => {
  it('accepts the studio email (any case) with the demo password', () => {
    expect(checkAdminCredentials(' Mario.BertStudios@gmail.com ', DEMO_ADMIN_PASSWORD)).toBe('ok')
  })
  it('rejects a wrong password or another email', () => {
    expect(checkAdminCredentials('mario.bertstudios@gmail.com', 'nope')).toBe('wrong_password')
    expect(checkAdminCredentials('someone@example.com', DEMO_ADMIN_PASSWORD)).toBe('unknown_email')
  })
})
