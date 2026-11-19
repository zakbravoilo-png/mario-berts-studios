import { useEffect, type ReactNode } from 'react'

/** Low-grunge heading for portal/admin pages. Also sets the document title. */
export function PortalHeader({ title, description, actions, eyebrow }: { title: string; description?: ReactNode; actions?: ReactNode; eyebrow?: string }) {
  useEffect(() => {
    document.title = `${title} — Mario Bert's Studios (prototype)`
  }, [title])
  return (
    <div className="mb-6 flex flex-wrap items-end justify-between gap-4">
      <div className="min-w-0">
        {eyebrow && <p className="eyebrow text-muted">{eyebrow}</p>}
        <h1 className="display mt-1 text-display-3 text-paper">{title}</h1>
        {description && <div className="mt-2 max-w-2xl text-sm text-muted">{description}</div>}
      </div>
      {actions && <div className="flex flex-wrap gap-3">{actions}</div>}
    </div>
  )
}
