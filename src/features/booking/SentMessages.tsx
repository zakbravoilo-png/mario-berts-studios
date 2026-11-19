import { Mail, MessageSquareText } from 'lucide-react'
import { useDemoState } from '../../services/demoStore'
import { formatDate, formatTime } from '../../utils/time'

/**
 * Shows the SMS/email confirmations generated for a booking reference.
 * Always labelled as simulated — the prototype cannot send messages.
 */
export function SentMessages({ reference, latestOnly = false }: { reference: string; latestOnly?: boolean }) {
  const s = useDemoState()
  const all = s.notifications.filter((n) => n.reference === reference)
  if (all.length === 0) return null
  const latestAt = all[all.length - 1]!.createdAt
  const list = latestOnly ? all.filter((n) => n.createdAt === latestAt) : [...all].reverse()
  return (
    <section aria-labelledby={`msgs-${reference}`} className="border border-slate p-5">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <h2 id={`msgs-${reference}`} className="font-display text-xl tracking-wide">
          {latestOnly ? 'Confirmation sent' : 'Messages'}
        </h2>
        <span className="demo-chip">Demo — simulated, not sent</span>
      </div>
      <p className="mt-2 text-sm text-paper/90">
        {latestOnly
          ? `A confirmation would be sent ${list.map((n) => (n.channel === 'sms' ? `by SMS to ${n.to}` : `by email to ${n.to}`)).join(' and ')}.`
          : 'Confirmations for this booking, newest first.'}{' '}
        <span className="text-muted">This prototype has no SMS or email service, so nothing actually leaves this browser.</span>
      </p>
      <ul className="mt-4 space-y-3">
        {list.map((n) => (
          <li key={n.id}>
            <details className="group border border-slate bg-ink">
              <summary className="flex cursor-pointer flex-wrap items-center gap-2 px-3 py-2 text-sm">
                {n.channel === 'sms' ? <MessageSquareText aria-hidden="true" className="size-4 text-rust-light" /> : <Mail aria-hidden="true" className="size-4 text-rust-light" />}
                <span className="font-semibold">{n.channel === 'sms' ? 'SMS' : 'Email'}</span>
                <span className="text-muted">to {n.to}</span>
                <span className="ml-auto text-xs text-muted">{formatDate(n.createdAt)} {formatTime(n.createdAt)}</span>
              </summary>
              <div className="border-t border-slate px-3 py-3 text-sm">
                {n.subject && <p className="font-semibold">{n.subject}</p>}
                <p className={`whitespace-pre-line ${n.subject ? 'mt-2' : ''} ${n.channel === 'sms' ? 'font-mono text-xs' : ''}`}>{n.body}</p>
              </div>
            </details>
          </li>
        ))}
      </ul>
    </section>
  )
}
