import { useEffect } from 'react'

/** Sets the document title (prototype pages). */
export function useTitle(title: string) {
  useEffect(() => {
    document.title = `${title} — Mario Bert's Studios (prototype)`
  }, [title])
}
