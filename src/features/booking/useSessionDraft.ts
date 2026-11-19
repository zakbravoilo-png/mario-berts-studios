import { useCallback, useState } from 'react'
import { STORAGE_PREFIX } from '../../app/resetDemo'

/** Flow draft kept in sessionStorage so a refresh doesn't lose progress. Storage access is guarded. */
export function useSessionDraft<T>(key: string, initial: () => T): [T, (update: Partial<T> | ((d: T) => T)) => void, () => void] {
  const fullKey = `${STORAGE_PREFIX}${key}`
  const [draft, setDraft] = useState<T>(() => {
    try {
      const raw = window.sessionStorage.getItem(fullKey)
      if (raw) return { ...initial(), ...(JSON.parse(raw) as Partial<T>) }
    } catch {
      /* blocked or corrupted — start fresh */
    }
    return initial()
  })

  const update = useCallback(
    (u: Partial<T> | ((d: T) => T)) => {
      setDraft((prev) => {
        const next = typeof u === 'function' ? u(prev) : { ...prev, ...u }
        try {
          window.sessionStorage.setItem(fullKey, JSON.stringify(next))
        } catch {
          /* ignore */
        }
        return next
      })
    },
    [fullKey],
  )

  const clear = useCallback(() => {
    try {
      window.sessionStorage.removeItem(fullKey)
    } catch {
      /* ignore */
    }
    setDraft(initial())
  }, [fullKey, initial])

  return [draft, update, clear]
}
