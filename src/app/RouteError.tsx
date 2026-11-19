import { useEffect, useState } from 'react'
import { isRouteErrorResponse, Link, useRouteError } from 'react-router'
import { RefreshCw } from 'lucide-react'
import { isStaleBuildError, reloadForNewVersion } from './staleBuild'

/**
 * Friendly error screen for any route. If the error is "old version after a deploy",
 * it reloads once automatically to fetch the new version.
 */
export function RouteError() {
  const error = useRouteError()
  const stale = isStaleBuildError(error)
  const [reloading] = useState(() => stale && reloadForNewVersion())

  useEffect(() => {
    document.title = "Something went wrong — Mario Bert's Studios"
  }, [])

  if (reloading) {
    return (
      <main className="grid min-h-dvh place-items-center bg-ink px-4 text-paper">
        <p className="flex items-center gap-2 text-sm"><RefreshCw aria-hidden="true" className="size-4 animate-spin" /> Updating to the latest version…</p>
      </main>
    )
  }

  const notFound = isRouteErrorResponse(error) && error.status === 404
  return (
    <main id="main" className="min-h-dvh bg-ink px-4 py-16 text-paper">
      <div className="mx-auto max-w-lg">
        <p className="eyebrow text-muted">{notFound ? 'Page not found' : 'Something went wrong'}</p>
        <h1 className="display mt-2 text-display-2">{stale ? 'A new version is out.' : 'That didn’t load.'}</h1>
        <p className="mt-4 text-paper/90">
          {stale
            ? 'The site was updated while this page was open. Reload to get the latest version.'
            : 'Please reload the page. If it keeps happening, go back to the home page.'}
        </p>
        <div className="mt-8 flex flex-wrap gap-4">
          <button type="button" className="btn btn-primary" onClick={() => window.location.reload()}>
            <RefreshCw aria-hidden="true" className="size-5" /> Reload
          </button>
          <Link to="/" className="btn btn-ghost">Home</Link>
        </div>
      </div>
    </main>
  )
}
