/**
 * MOCK DATA SERVICE. A tiny client-side store persisted to localStorage so that an
 * admin action (e.g. verifying a payment) shows up in the customer portal.
 * This is NOT a backend: no locking, no auth, data lives only in this browser.
 * Replace the action functions with API calls when a real backend exists.
 */
import { useSyncExternalStore } from 'react'
import type { DemoState } from './demoState'
import { createSeed } from '../data/seed'
import { seedProducts } from '../data/products'
import { rentalEquipment } from '../data/rentalEquipment'
import { rooms } from '../data/rooms'
import type { AvailabilityContext } from '../features/booking/availability'
import { STORAGE_PREFIX } from '../app/resetDemo'
import { todayManila, toMs } from '../utils/time'

const KEY = `${STORAGE_PREFIX}state`

function safeLocal(): Storage | null {
  try {
    return window.localStorage
  } catch {
    return null
  }
}

/** Mark finished bookings/lessons as completed (time has passed). */
function refreshTimeStatuses(s: DemoState, now: number): DemoState {
  let changed = false
  const bookings = s.bookings.map((b) => {
    if (b.status === 'confirmed' && toMs(b.endAt) <= now) {
      changed = true
      return { ...b, status: 'completed' as const }
    }
    return b
  })
  const lessons = s.lessons.map((l) => {
    if (l.status === 'confirmed' && toMs(l.endAt) <= now) {
      changed = true
      return { ...l, status: 'completed' as const }
    }
    return l
  })
  return changed ? { ...s, bookings, lessons } : s
}

function load(): DemoState {
  const now = Date.now()
  const store = safeLocal()
  if (store) {
    try {
      const raw = store.getItem(KEY)
      if (raw) {
        const parsed = JSON.parse(raw) as DemoState & { customer?: DemoState['customers'][number]; version: number }
        // v2 → v3: single demo customer becomes a list of accounts.
        if (parsed && (parsed.version as number) === 2 && parsed.customer) {
          parsed.customers = [parsed.customer]
          delete parsed.customer
          parsed.version = 3
        }
        if (parsed && parsed.version === 3 && Array.isArray(parsed.bookings)) {
          parsed.notifications ??= []
          // Add catalog items introduced after this browser's data was saved.
          for (const p of seedProducts) if (!parsed.products.some((x) => x.id === p.id)) parsed.products = [...parsed.products, p]
          return refreshTimeStatuses(parsed, now)
        }
      }
    } catch {
      /* corrupted or blocked — fall back to seed */
    }
  }
  return createSeed(now)
}

let state: DemoState | null = null
const listeners = new Set<() => void>()

function current(): DemoState {
  if (!state) state = load()
  return state
}

function persist(s: DemoState) {
  const store = safeLocal()
  if (!store) return
  try {
    store.setItem(KEY, JSON.stringify(s))
  } catch {
    /* quota or blocked — state still works for this page view */
  }
}

export function getState(): DemoState {
  return current()
}

export function setState(updater: (s: DemoState) => DemoState): DemoState {
  state = updater(current())
  persist(state)
  listeners.forEach((l) => l())
  return state
}

function subscribe(listener: () => void) {
  listeners.add(listener)
  const onStorage = (e: StorageEvent) => {
    if (e.key === KEY) {
      state = load()
      listener()
    }
  }
  window.addEventListener('storage', onStorage)
  return () => {
    listeners.delete(listener)
    window.removeEventListener('storage', onStorage)
  }
}

/** React hook: subscribe to the demo store. */
export function useDemoState(): DemoState {
  return useSyncExternalStore(subscribe, current, current)
}

/** Availability context derived from the store (rooms are static; stock is admin-adjustable). */
export function availabilityContext(s: DemoState): AvailabilityContext {
  return {
    rooms,
    bookings: s.bookings,
    lessons: s.lessons,
    instructors: s.instructors,
    settings: s.settings,
    stock: s.rentalStock,
  }
}

/** Rental list with the store's (possibly adjusted) stock numbers. */
export function rentalsWithStock(s: DemoState) {
  return rentalEquipment.map((r) => ({ ...r, totalQuantity: s.rentalStock[r.id] ?? r.totalQuantity }))
}

/** Next reference like MBS-2611-0042 (prefix + Manila YYMM + sequence). */
export function nextReference(s: DemoState, prefix: string, now = Date.now()): { reference: string; counters: Record<string, number> } {
  const n = (s.counters[prefix] ?? 0) + 1
  const today = todayManila(now)
  return {
    reference: `${prefix}-${today.slice(2, 4)}${today.slice(5, 7)}-${String(n).padStart(4, '0')}`,
    counters: { ...s.counters, [prefix]: n },
  }
}

export function newId(prefix: string): string {
  const rand = Math.random().toString(36).slice(2, 8)
  return `${prefix}-${Date.now().toString(36)}-${rand}`
}
