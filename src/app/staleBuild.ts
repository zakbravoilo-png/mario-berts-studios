/**
 * After a new deploy, page files get new names. A tab still running the previous
 * version will ask for old files that no longer exist. When that happens we reload
 * once to pick up the new version. A short guard stops reload loops.
 */
const KEY = 'mbs:stale-reload-at'
const GUARD_MS = 30_000

export function isStaleBuildError(err: unknown): boolean {
  const msg = err instanceof Error ? err.message : String(err ?? '')
  return /Failed to fetch dynamically imported module|Importing a module script failed|error loading dynamically imported module|Unable to preload CSS/i.test(msg)
}

/** Reload once to get the latest version. Returns false if we already tried recently. */
export function reloadForNewVersion(): boolean {
  try {
    const last = Number(window.sessionStorage.getItem(KEY) ?? 0)
    if (Date.now() - last < GUARD_MS) return false
    window.sessionStorage.setItem(KEY, String(Date.now()))
  } catch {
    /* storage blocked — still try once */
  }
  window.location.reload()
  return true
}

/** Vite fires this when a lazy-loaded file can't be fetched. */
export function installStaleBuildHandler() {
  window.addEventListener('vite:preloadError', (event) => {
    if (reloadForNewVersion()) event.preventDefault()
  })
}
