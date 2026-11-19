/** Prefix for every demo-state storage key (localStorage + sessionStorage). */
export const STORAGE_PREFIX = 'mbs:'

/** Clears all demo state and reloads to seed data. Storage access is wrapped — it may be blocked. */
export function resetDemoData(): void {
  for (const store of [safeStorage('localStorage'), safeStorage('sessionStorage')]) {
    if (!store) continue
    try {
      const keys: string[] = []
      for (let i = 0; i < store.length; i++) {
        const k = store.key(i)
        if (k?.startsWith(STORAGE_PREFIX)) keys.push(k)
      }
      keys.forEach((k) => store.removeItem(k))
    } catch {
      /* ignore — fall back to seed data */
    }
  }
  window.location.reload()
}

function safeStorage(name: 'localStorage' | 'sessionStorage'): Storage | null {
  try {
    return window[name]
  } catch {
    return null
  }
}
