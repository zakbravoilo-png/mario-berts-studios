import type { ReactNode } from 'react'
import type { LucideIcon } from 'lucide-react'

/** Designed empty state (reference 04), dark. */
export function EmptyState({ icon: Icon, title, children, action }: { icon: LucideIcon; title: string; children?: ReactNode; action?: ReactNode }) {
  return (
    <div className="flex flex-col items-center border border-dashed border-slate px-6 py-12 text-center">
      <span className="grid size-14 place-items-center rounded-full border border-slate bg-ink">
        <Icon aria-hidden="true" className="size-6 text-paper" />
      </span>
      <p className="mt-4 text-lg font-semibold text-paper">{title}</p>
      {children && <div className="mt-1 max-w-md text-sm text-muted">{children}</div>}
      {action && <div className="mt-6">{action}</div>}
    </div>
  )
}
