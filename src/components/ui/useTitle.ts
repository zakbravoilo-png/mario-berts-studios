import { useEffect } from 'react'

/** Sets the document title (prototype pages). */
export function useTitle(title: string) {
  useEffect(() => {
    document.title = `${title} — Manoy Bart's Studio (prototype)`
  }, [title])
}
