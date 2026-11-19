import type { ReactNode } from 'react'
import { AlertTriangle, CheckCircle2, FlaskConical, Info, XCircle, type LucideIcon } from 'lucide-react'

type Tone = 'info' | 'warning' | 'error' | 'success' | 'demo'

const META: Record<Tone, { icon: LucideIcon; label: string; border: string }> = {
  info: { icon: Info, label: 'Note', border: 'border-slate' },
  warning: { icon: AlertTriangle, label: 'Important', border: 'border-paper' },
  error: { icon: XCircle, label: 'Error', border: 'border-rust-light' },
  success: { icon: CheckCircle2, label: 'Done', border: 'border-paper' },
  demo: { icon: FlaskConical, label: 'Demo', border: 'border-slate border-dashed' },
}

/** Plain panel with icon + label + text (status never relies on colour alone). */
export function Callout({ tone = 'info', title, children, className = '' }: { tone?: Tone; title?: ReactNode; children?: ReactNode; className?: string }) {
  const m = META[tone]
  return (
    <div role={tone === 'error' ? 'alert' : 'note'} className={`flex gap-3 border-2 ${m.border} bg-ink p-4 text-sm ${className}`}>
      <m.icon aria-hidden="true" className={`mt-0.5 size-5 shrink-0 ${tone === 'error' || tone === 'warning' ? 'text-rust-light' : 'text-paper'}`} />
      <div className="min-w-0 text-paper">
        <p className="font-semibold">
          <span className="sr-only">{m.label}: </span>
          {title}
        </p>
        {children && <div className={`${title ? 'mt-1' : ''} text-paper/90`}>{children}</div>}
      </div>
    </div>
  )
}
