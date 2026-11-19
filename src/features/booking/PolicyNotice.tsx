import { AlertTriangle } from 'lucide-react'
import { defaultSettings } from '../../data/settings'

/** The confirmed downpayment + cancellation policy, in plain language. Shown before any commitment. */
export function PolicyNotice({ downpaymentRate = defaultSettings.downpaymentRate, compact = false, className = '' }: { downpaymentRate?: number; compact?: boolean; className?: string }) {
  const pct = Math.round(downpaymentRate * 100)
  return (
    <div role="note" aria-labelledby="policy-title" className={`border-2 border-paper bg-ink p-5 ${className}`}>
      <div className="flex items-start gap-3">
        <AlertTriangle aria-hidden="true" className="mt-0.5 size-6 shrink-0 text-rust-light" />
        <div>
          <h3 id="policy-title" className="font-display text-xl tracking-wide text-paper">
            Payment &amp; cancellation policy
          </h3>
          <ul className="mt-2 list-disc space-y-1.5 pl-5 text-sm text-paper/90 marker:text-rust-light">
            <li>
              A <strong>{pct}% downpayment via GCash</strong> is required when you book a rehearsal.
            </li>
            <li>
              Cancel <strong>before the day</strong> of your booking (Asia/Manila time) and your downpayment is{' '}
              <strong>returned via GCash</strong>.
            </li>
            <li>Cancelling on the booking day itself isn&apos;t possible; the downpayment is then kept.</li>
            <li>The remaining {100 - pct}% is paid <strong>after your rehearsal</strong>, in cash at the studio or by GCash.</li>
          </ul>
          {!compact && (
            <p className="mt-3 text-xs text-muted">
              Prototype: GCash is simulated. No payment is processed and no GCash number is shown until the studio provides
              one.
            </p>
          )}
        </div>
      </div>
    </div>
  )
}
