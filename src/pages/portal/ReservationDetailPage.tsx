import { useState } from 'react'
import { Link, useParams } from 'react-router'
import { ArrowLeft } from 'lucide-react'
import { useDemoState } from '../../services/demoStore'
import { useCurrentCustomer, ownsRecord } from '../../services/accounts'
import { cancelBooking, cancelLesson, submitPayment } from '../../services/actions'
import { canCustomerCancel } from '../../features/booking/availability'
import { useNow } from '../../features/booking/useNow'
import { LessonTicket, ReservationTicket } from '../../features/booking/ReservationTicket'
import { PriceReceipt } from '../../features/booking/ExampleReceipt'
import { PolicyNotice } from '../../features/booking/PolicyNotice'
import { SentMessages } from '../../features/booking/SentMessages'
import { priceFromBooking } from '../../features/booking/pricing'
import { PortalHeader } from '../../components/ui/PortalHeader'
import { Callout } from '../../components/ui/Callout'
import { StatusLabel } from '../../components/ui/StatusLabel'
import { TextField } from '../../components/ui/Field'
import type { LessonRequest, RehearsalBooking } from '../../types/domain'
import { roomName } from '../../data/rooms'
import { formatPHP } from '../../utils/money'
import { formatDate, formatTime } from '../../utils/time'

export interface BackLink {
  to: string
  label: string
}
const PORTAL_BACK: BackLink = { to: '/portal/reservations', label: 'All reservations' }

function Back({ back = PORTAL_BACK }: { back?: BackLink }) {
  return (
    <Link to={back.to} className="mb-4 inline-flex items-center gap-2 text-sm text-paper/85 hover:text-paper">
      <ArrowLeft aria-hidden="true" className="size-4" /> {back.label}
    </Link>
  )
}

export function ReservationDetailPage() {
  const { ref = '' } = useParams()
  const s = useDemoState()
  const me = useCurrentCustomer()!
  const booking = s.bookings.find((b) => b.reference === ref && ownsRecord(me, b))
  const lesson = s.lessons.find((l) => l.reference === ref && ownsRecord(me, l))
  if (booking) return <RehearsalDetail booking={booking} />
  if (lesson) return <LessonDetail lesson={lesson} instructorName={s.instructors.find((i) => i.id === lesson.instructorId)?.displayName ?? 'Instructor'} />
  return (
    <>
      <Back />
      <PortalHeader title="Reservation not found" />
      <Callout tone="info" title={`No reservation “${ref}” in this demo account.`}>It may have been reset with the demo data.</Callout>
    </>
  )
}

function CancelSection({ startAt, onCancel, refundAmount }: { startAt: string; onCancel: () => string[] | null; refundAmount?: number }) {
  const now = useNow()
  const [confirming, setConfirming] = useState(false)
  const [errors, setErrors] = useState<string[]>([])
  const allowed = canCustomerCancel(startAt, now)
  return (
    <section aria-labelledby="cancel-title" className="border border-slate p-5">
      <h2 id="cancel-title" className="font-display text-xl tracking-wide">Cancel</h2>
      {!allowed ? (
        <p className="mt-2 text-sm text-paper/90">
          Cancellation is only possible <strong>before the day</strong> of the booking ({formatDate(startAt)}, Asia/Manila). It can no longer be cancelled here.
        </p>
      ) : !confirming ? (
        <>
          <p className="mt-2 text-sm text-paper/90">
            You can cancel until the end of the day before ({formatDate(startAt)} is the booking day).
            {refundAmount !== undefined && <> Your {formatPHP(refundAmount)} downpayment will be <strong>returned via GCash</strong>.</>}
          </p>
          <button type="button" className="btn btn-ghost mt-4" onClick={() => setConfirming(true)}>Cancel this booking…</button>
        </>
      ) : (
        <div className="mt-3 space-y-3">
          <Callout tone="warning" title="Cancel for good?">
            {refundAmount !== undefined ? <>The studio will return your {formatPHP(refundAmount)} downpayment via GCash. </> : null}This can&apos;t be undone in the demo.
          </Callout>
          <div className="flex flex-wrap gap-3">
            <button type="button" className="btn btn-primary" onClick={() => setErrors(onCancel() ?? [])}>Yes, cancel</button>
            <button type="button" className="btn btn-ghost" onClick={() => setConfirming(false)}>Keep booking</button>
          </div>
          {errors.length > 0 && <Callout tone="error" title="Could not cancel">{errors.join(' ')}</Callout>}
        </div>
      )}
    </section>
  )
}

export function RehearsalDetail({ booking: b, back }: { booking: RehearsalBooking; back?: BackLink }) {
  const [ref, setRef] = useState('')
  const [file, setFile] = useState<string | null>(null)
  const [errors, setErrors] = useState<string[]>([])
  const price = priceFromBooking(b)
  const live = ['awaiting_payment', 'awaiting_verification', 'confirmed'].includes(b.status)

  function pay() {
    if (!ref.trim()) return setErrors(['Enter a demo GCash reference number.'])
    const r = submitPayment(b.id, ref.trim(), file)
    setErrors(r.ok ? [] : r.errors)
  }

  return (
    <>
      <Back back={back} />
      <PortalHeader title={`Reservation ${b.reference}`} eyebrow="Rehearsal" description={<>Booked {formatDate(b.createdAt)} · {roomName(b.roomId)}</>} />
      <ReservationTicket booking={b} />
      <div className="mt-8 grid gap-8 lg:grid-cols-[1fr_20rem]">
        <div className="space-y-6">
          <section aria-labelledby="pay-title" className="border border-slate p-5">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <h2 id="pay-title" className="font-display text-xl tracking-wide">GCash downpayment</h2>
              <StatusLabel status={b.payment.status} variant="plain" />
            </div>
            <dl className="mt-3 grid gap-2 text-sm sm:grid-cols-2">
              <div><dt className="text-muted">Amount</dt><dd className="m-0 font-mono font-bold">{formatPHP(b.downpaymentRequired)}</dd></div>
              <div><dt className="text-muted">Reference (demo)</dt><dd className="m-0 font-mono">{b.payment.reference ?? '—'}</dd></div>
              <div><dt className="text-muted">Proof (demo)</dt><dd className="m-0">{b.payment.proofFileName ?? '—'}</dd></div>
              <div><dt className="text-muted">Remaining balance</dt><dd className="m-0 font-mono">{formatPHP(b.balance)} · after rehearsal, cash or GCash</dd></div>
            </dl>
            {b.status === 'awaiting_payment' && (
              <div className="mt-5 space-y-4 border-t border-slate pt-5">
                <Callout tone="warning" title="Not held yet">The room and gear are not held until you submit the downpayment reference. GCash details to be provided by studio.</Callout>
                <div className="grid gap-4 sm:grid-cols-2">
                  <TextField label="GCash reference number (demo)" value={ref} onChange={(e) => setRef(e.target.value)} placeholder="e.g. DEMO-123456" />
                  <TextField label="Proof of payment (demo)" type="file" accept="image/*,.pdf" optional hint="Only the file name is kept." onChange={(e) => setFile(e.target.files?.[0]?.name ?? null)} />
                </div>
                <button type="button" className="btn btn-primary" onClick={pay}>Submit reference</button>
                {errors.length > 0 && <Callout tone="error" title="Could not submit">{errors.join(' ')}</Callout>}
              </div>
            )}
            {b.status === 'awaiting_verification' && <p className="mt-4 text-sm text-paper/90">Submitted. The studio will verify it and confirm your booking (demo admin action).</p>}
            {b.status === 'confirmed' && <p className="mt-4 text-sm text-paper/90">Verified — your booking is confirmed.</p>}
            {b.status === 'rejected' && <p className="mt-4 text-sm text-paper/90">This booking was rejected in the demo admin.{b.adminNote ? ` Note: ${b.adminNote}` : ''} Rejection policy is to be confirmed by the studio.</p>}
            {b.status === 'cancelled' && b.cancelledAt && (
              <p className="mt-4 text-sm text-paper/90">
                Cancelled{b.cancelledBy === 'studio' ? ' by the studio' : ''} on {formatDate(b.cancelledAt)} at {formatTime(b.cancelledAt)}.{b.cancelReason ? ` Reason: ${b.cancelReason}.` : ''}{' '}
                {b.payment.refund?.status === 'due'
                  ? `Your ${formatPHP(b.payment.refund.amount)} downpayment will be returned via GCash.`
                  : b.payment.refund?.status === 'sent'
                    ? `Your ${formatPHP(b.payment.refund.amount)} downpayment was returned via GCash${b.payment.refund.reference ? ` (ref ${b.payment.refund.reference})` : ''}.`
                    : b.payment.status === 'not_submitted'
                      ? 'No downpayment was paid.'
                      : 'The downpayment is kept (cancelled on the booking day).'}
              </p>
            )}
          </section>
          {live && <CancelSection startAt={b.startAt} refundAmount={b.payment.status === 'submitted' || b.payment.status === 'verified' ? b.downpaymentRequired : undefined} onCancel={() => { const r = cancelBooking(b.id); return r.ok ? null : r.errors }} />}
          <SentMessages reference={b.reference} />
          <PolicyNotice compact />
        </div>
        <div>
          <PriceReceipt price={price} title={b.reference} roomLabel={roomName(b.roomId)} barcodeValue={b.reference} />
        </div>
      </div>
    </>
  )
}

export function LessonDetail({ lesson: l, instructorName, back }: { lesson: LessonRequest; instructorName: string; back?: BackLink }) {
  const live = ['requested', 'confirmed'].includes(l.status)
  return (
    <>
      <Back back={back} />
      <PortalHeader title={`Lesson ${l.reference}`} eyebrow="Lesson request" />
      <LessonTicket lesson={l} instructorName={instructorName} />
      <div className="mt-8 max-w-2xl space-y-6">
        {l.status === 'requested' && <Callout tone="info" title="Awaiting studio response">The studio will confirm this lesson (demo admin action). You pay the full lesson fee on the day, at the studio. Nothing is paid online.</Callout>}
        {live && (
          <CancelSection
            startAt={l.startAt}
            onCancel={() => {
              const r = cancelLesson(l.id)
              return r.ok ? null : r.errors
            }}
          />
        )}
        <SentMessages reference={l.reference} />
        <p className="text-xs text-muted">Lesson cancellation terms have not been published; this demo applies the same &ldquo;before the day&rdquo; rule as rehearsals.</p>
      </div>
    </>
  )
}
