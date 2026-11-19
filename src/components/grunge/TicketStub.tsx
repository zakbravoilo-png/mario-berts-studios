import type { ReactNode } from 'react'
import { Barcode } from './Barcode'

export interface TicketField {
  label: string
  value: ReactNode
}

interface TicketStubProps {
  reference: string
  title: string
  /** Main body fields (date, time, room...). */
  fields: TicketField[]
  /** Status label shown on the stub — must be text, never colour alone. */
  status?: ReactNode
  /** Small print under the perforation. */
  footnote?: ReactNode
  className?: string
}

/**
 * Reservation styled as a gig ticket (handoff §8 signature idea):
 * perforated edge with notches, monospace reference, decorative barcode.
 * Horizontal on ≥sm screens, stacked on mobile.
 */
export function TicketStub({ reference, title, fields, status, footnote, className = '' }: TicketStubProps) {
  return (
    <article
      className={`ticket sm:ticket-h [--perf:calc(100%-6rem)] sm:[--perf:calc(100%-12rem)] flex flex-col sm:flex-row ${className}`}
      aria-label={`Reservation ${reference}`}
    >
      <div className="flex-1 p-5 sm:p-6">
        <div className="flex flex-wrap items-start justify-between gap-2">
          <p className="eyebrow text-ink">Manoy Bart&apos;s Studio · admit one</p>
          {status}
        </div>
        <h3 className="display mt-2 text-display-3 text-rust">{title}</h3>
        <dl className="mt-4 grid grid-cols-2 gap-x-4 gap-y-3 sm:grid-cols-3">
          {fields.map((f) => (
            <div key={f.label}>
              <dt className="eyebrow text-[0.65rem] text-ink/75">{f.label}</dt>
              <dd className="m-0 font-mono text-sm font-bold text-ink">{f.value}</dd>
            </div>
          ))}
        </dl>
        {footnote && <p className="mt-4 text-xs text-ink/80">{footnote}</p>}
      </div>
      <div className="ticket-perf sm:perf-v flex h-24 flex-row items-center gap-4 px-5 sm:h-auto sm:py-5 sm:w-48 sm:flex-col sm:justify-center">
        <div className="min-w-0 flex-1 sm:w-full sm:flex-none">
          <p className="eyebrow text-[0.65rem] text-ink/75">Ref</p>
          <p className="font-mono text-sm font-bold tracking-wide whitespace-nowrap text-ink">{reference}</p>
        </div>
        <Barcode value={reference} className="w-28 text-ink sm:w-full" height={46} />
      </div>
    </article>
  )
}
