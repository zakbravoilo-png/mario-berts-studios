/**
 * DEMO SIGN-IN. Passwordless, one-time-code flow for customers (contact number)
 * and the studio admin (email). Because this prototype has no server, the code is
 * generated and checked in the browser and shown on screen instead of being sent.
 * This is NOT security: anyone with dev tools can bypass it. Production needs a
 * server-side auth provider (and e.g. Cloudflare Access in front of /admin).
 */
import { useSyncExternalStore } from 'react'
import { STORAGE_PREFIX } from '../app/resetDemo'
import { studioContact } from '../data/services'
import { normalizePhone } from '../features/booking/customerSchema'

export type Session = { role: 'customer'; customerId: string; since: string } | { role: 'admin'; email: string; since: string }

const SESSION_KEY = `${STORAGE_PREFIX}session`
const CHALLENGE_KEY = `${STORAGE_PREFIX}challenge`

/** Emails allowed into the demo admin. */
export const ADMIN_EMAILS = [studioContact.email].filter((e): e is string => !!e).map((e) => e.toLowerCase())

// ── session store ────────────────────────────────────────────────────────

function readSession(): Session | null {
  try {
    const raw = window.localStorage.getItem(SESSION_KEY)
    return raw ? (JSON.parse(raw) as Session) : null
  } catch {
    return null
  }
}

let current: Session | null | undefined
const listeners = new Set<() => void>()

function get(): Session | null {
  if (current === undefined) current = readSession()
  return current
}

function set(s: Session | null) {
  current = s
  try {
    if (s) window.localStorage.setItem(SESSION_KEY, JSON.stringify(s))
    else window.localStorage.removeItem(SESSION_KEY)
  } catch {
    /* storage blocked — session lasts for this page view only */
  }
  listeners.forEach((l) => l())
}

function subscribe(l: () => void) {
  listeners.add(l)
  const onStorage = (e: StorageEvent) => {
    if (e.key === SESSION_KEY) {
      current = readSession()
      l()
    }
  }
  window.addEventListener('storage', onStorage)
  return () => {
    listeners.delete(l)
    window.removeEventListener('storage', onStorage)
  }
}

export function useSession(): Session | null {
  return useSyncExternalStore(subscribe, get, get)
}

export function signInCustomer(customerId: string) {
  set({ role: 'customer', customerId, since: new Date().toISOString() })
}

export function signInAdmin(email: string) {
  set({ role: 'admin', email: email.toLowerCase(), since: new Date().toISOString() })
}

export function signOut() {
  set(null)
}

// ── one-time codes (demo) ────────────────────────────────────────────────

export interface Challenge {
  /** Normalised phone number or lower-cased email. */
  target: string
  code: string
  expiresAt: number
  attempts: number
}

export const CODE_TTL_MS = 5 * 60_000
export const MAX_ATTEMPTS = 5

export function normalizeTarget(kind: 'phone' | 'email', raw: string): string {
  return kind === 'phone' ? normalizePhone(raw) : raw.trim().toLowerCase()
}

export function newChallenge(target: string, now = Date.now()): Challenge {
  const n = new Uint32Array(1)
  crypto.getRandomValues(n)
  const code = String(n[0]! % 1_000_000).padStart(6, '0')
  return { target, code, expiresAt: now + CODE_TTL_MS, attempts: 0 }
}

export type CheckResult = 'ok' | 'wrong' | 'expired' | 'locked' | 'mismatch'

/** Pure check — unit-tested. */
export function checkCode(ch: Challenge | null, target: string, input: string, now = Date.now()): CheckResult {
  if (!ch || ch.target !== target) return 'mismatch'
  if (ch.attempts >= MAX_ATTEMPTS) return 'locked'
  if (now > ch.expiresAt) return 'expired'
  return input.replace(/\s/g, '') === ch.code ? 'ok' : 'wrong'
}

export function requestCode(target: string): Challenge {
  const ch = newChallenge(target)
  try {
    window.sessionStorage.setItem(CHALLENGE_KEY, JSON.stringify(ch))
  } catch {
    /* ignore */
  }
  return ch
}

export function verifyCode(target: string, input: string): CheckResult {
  let ch: Challenge | null
  try {
    const raw = window.sessionStorage.getItem(CHALLENGE_KEY)
    ch = raw ? (JSON.parse(raw) as Challenge) : null
  } catch {
    ch = null
  }
  const r = checkCode(ch, target, input)
  try {
    if (r === 'ok') window.sessionStorage.removeItem(CHALLENGE_KEY)
    else if (ch && r === 'wrong') window.sessionStorage.setItem(CHALLENGE_KEY, JSON.stringify({ ...ch, attempts: ch.attempts + 1 }))
  } catch {
    /* ignore */
  }
  return r
}
