import { useState } from 'react'
import { Ban, CheckCircle2, Undo2 } from 'lucide-react'
import type { RehearsalBooking } from '../../types/domain'
import { adminCancelBooking, adminCancelOutcome, adminMarkRefundSent } from '../../services/actions'
import { useNow } from '../booking/useNow'
import { Callout } from '../../components/ui/Callout'
import { AdminButton, adminInput } from './adminUi'
import { formatPHP } from '../../utils/money'
import { formatDate, formatTime } from '../../utils/time'

/**
 * Studio cancellation + manual GCash refund (user rule, 2026-11-19):
 * on/after the booking day the downpayment is kept; before the day the studio
 * returns it manually from GCash, then marks it sent here.
 */
export function CancelPanel({ booking: b }: { booking: RehearsalBooking }) {
  const now = useNow()
  const [open, setOpen] = useState(false)
  const [reason, setReason] = useState('')
  const [refundRef, setRefundRef] = useState('')
  const [msg, setMsg] = useState<{ ok: boolean; text: string } | null>(null)
  const active = ['awaiting_payment', 'awaiting_verification', 'confirmed'].includes(b.status)
  const outcome = adminCancelOutcome(b, now)
  const refund = b.payment.refund
  const dp = formatPHP(b.downpaymentRequired)

  const outcomeText =
    outcome === 'refund_due'
      ? `Cancelling before the booking day: you'll need to return the ${dp} downpayment to the customer via GCash manually.`
      : outcome === 'downpayment_kept'
        ? `Cancelling on the booking day: the ${dp} downpayment is kept (not refunded).`
        : 'No downpayment has been received, so there is nothing to return.'

  return (
    <section aria-labelledby="cancel-title" className="border border-slate p-4">
      <h2 id="cancel-title" className="font-semibold">Cancellation</h2>

      {b.status === 'cancelled' ? (
        <div className="mt-2 space-y-3 text-sm">
          <p>
            Cancelled {b.cancelledAt ? `on ${formatDate(b.cancelledAt)} at ${formatTime(b.cancelledAt)}` : ''} by {b.cancelledBy === 'studio' ? 'the studio' : 'the customer'}.
            {b.cancelReason && <span className="block text-muted">Reason: {b.cancelReason}</span>}
          </p>
          {refund?.status === 'due' && (
            <>
              <Callout tone="warning" title={`Refund to send: ${formatPHP(refund.amount)} via GCash`}>
                Send it manually from the studio&apos;s GCash to the customer ({b.customer.phone || 'no number on file'}), then record it below.
              </Callout>
              <div className="flex flex-wrap items-end gap-3">
                <label>
                  <span className="mb-1 block text-muted">GCash reference of the refund (optional)</span>
                  <input className={adminInput} value={refundRef} onChange={(e) => setRefundRef(e.target.value)} placeholder="e.g. 1234 567 890" />
                </label>
                <AdminButton tone="primary" onClick={() => { const r = adminMarkRefundSent(b.id, refundRef); setMsg(r.ok ? { ok: true, text: 'Refund recorded as sent. The customer has been notified (simulated).' } : { ok: false, text: r.errors.join(' ') }) }}>
                  <CheckCircle2 aria-hidden="true" className="size-4" /> Mark refund as sent
                </AdminButton>
              </div>
            </>
          )}
          {refund?.status === 'sent' && (
            <p className="flex items-center gap-2"><CheckCircle2 aria-hidden="true" className="size-4 text-rust-light" /> Refund of {formatPHP(refund.amount)} sent{refund.sentAt ? ` on ${formatDate(refund.sentAt)}` : ''}{refund.reference ? ` (GCash ref ${refund.reference})` : ''}.</p>
          )}
          {!refund && b.cancelledBy === 'studio' && (b.payment.status === 'submitted' || b.payment.status === 'verified') && <p className="text-muted">Downpayment kept (cancelled on the booking day).</p>}
          {!refund && b.cancelledBy === 'customer' && <p className="text-muted">Customer cancelled before the day — downpayment is non-refundable per the booking policy.</p>}
        </div>
      ) : !active ? (
        <p className="mt-2 text-sm text-muted">This booking can&apos;t be cancelled ({b.status.replace(/_/g, ' ')}).</p>
      ) : !open ? (
        <div className="mt-2">
          <p className="text-sm text-muted">{outcomeText}</p>
          <AdminButton className="mt-3" onClick={() => setOpen(true)}><Ban aria-hidden="true" className="size-4" /> Cancel booking…</AdminButton>
        </div>
      ) : (
        <div className="mt-3 space-y-3 text-sm">
          <Callout tone="warning" title="Cancel this booking?">{outcomeText} The room and gear are released, and the customer is notified (simulated).</Callout>
          <label className="block">
            <span className="mb-1 block text-muted">Reason (optional, shown to the customer)</span>
            <input className={`${adminInput} w-full`} value={reason} onChange={(e) => setReason(e.target.value)} placeholder="e.g. Room maintenance" />
          </label>
          <div className="flex flex-wrap gap-2">
            <AdminButton tone="primary" onClick={() => { const r = adminCancelBooking(b.id, reason, now); setOpen(false); setMsg(r.ok ? { ok: true, text: r.value === 'refund_due' ? 'Booking cancelled. Refund the downpayment via GCash, then mark it sent.' : 'Booking cancelled.' } : { ok: false, text: r.errors.join(' ') }) }}>
              Yes, cancel booking
            </AdminButton>
            <AdminButton onClick={() => setOpen(false)}><Undo2 aria-hidden="true" className="size-4" /> Keep booking</AdminButton>
          </div>
        </div>
      )}
      {msg && <Callout tone={msg.ok ? 'success' : 'error'} title={msg.text} className="mt-3" />}
    </section>
  )
}
