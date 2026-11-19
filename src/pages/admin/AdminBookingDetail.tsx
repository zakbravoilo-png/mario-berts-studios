import { useState } from 'react'
import { Link, useParams } from 'react-router'
import { ArrowLeft } from 'lucide-react'
import { useDemoState } from '../../services/demoStore'
import { adminRejectBooking, adminVerifyAndConfirm } from '../../services/actions'
import { PortalHeader } from '../../components/ui/PortalHeader'
import { StatusLabel } from '../../components/ui/StatusLabel'
import { Callout } from '../../components/ui/Callout'
import { PriceReceipt } from '../../features/booking/ExampleReceipt'
import { priceFromBooking } from '../../features/booking/pricing'
import { AdminButton, adminInput } from '../../features/admin/adminUi'
import { roomName } from '../../data/rooms'
import { equipmentLabel } from '../../data/rentalEquipment'
import { formatPHP } from '../../utils/money'
import { formatDate, formatRange, formatTime } from '../../utils/time'

export function AdminBookingDetail() {
  const { ref = '' } = useParams()
  const s = useDemoState()
  const b = s.bookings.find((x) => x.reference === ref)
  const [note, setNote] = useState('')
  const [msg, setMsg] = useState<{ ok: boolean; text: string } | null>(null)

  if (!b) {
    return (
      <>
        <Link to="/admin/bookings" className="mb-4 inline-flex items-center gap-2 text-sm"><ArrowLeft aria-hidden="true" className="size-4" /> Bookings</Link>
        <Callout tone="info" title={`Booking ${ref} not found`} />
      </>
    )
  }
  const act = (r: { ok: true } | { ok: false; errors: string[] }, ok: string) => setMsg(r.ok ? { ok: true, text: ok } : { ok: false, text: r.errors.join(' ') })

  return (
    <>
      <Link to="/admin/bookings" className="mb-4 inline-flex items-center gap-2 text-sm hover:underline"><ArrowLeft aria-hidden="true" className="size-4" /> Bookings</Link>
      <PortalHeader title={`Booking ${b.reference}`} actions={<StatusLabel status={b.status} variant="plain" />} />
      <div className="grid gap-6 xl:grid-cols-[1fr_20rem]">
        <div className="space-y-6">
          <section aria-labelledby="det-title" className="border border-slate p-4">
            <h2 id="det-title" className="font-semibold">Details</h2>
            <dl className="mt-3 grid gap-3 text-sm sm:grid-cols-2">
              <div><dt className="text-muted">Customer</dt><dd className="m-0">{b.customer.name}{b.customer.bandName ? ` · ${b.customer.bandName}` : ''}</dd></div>
              <div><dt className="text-muted">Contact</dt><dd className="m-0">{[b.customer.email, b.customer.phone].filter(Boolean).join(' · ') || '—'}</dd></div>
              <div><dt className="text-muted">Room</dt><dd className="m-0">{roomName(b.roomId)}</dd></div>
              <div><dt className="text-muted">When</dt><dd className="m-0">{formatDate(b.startAt)}, {formatRange(b.startAt, b.endAt)}</dd></div>
              <div><dt className="text-muted">Created</dt><dd className="m-0">{formatDate(b.createdAt)} {formatTime(b.createdAt)}</dd></div>
              {b.customer.notes && <div className="sm:col-span-2"><dt className="text-muted">Notes</dt><dd className="m-0">{b.customer.notes}</dd></div>}
            </dl>
          </section>

          <section aria-labelledby="pay-title" className="border border-slate p-4">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <h2 id="pay-title" className="font-semibold">Payment review (mock GCash)</h2>
              <StatusLabel status={b.payment.status} variant="plain" />
            </div>
            <dl className="mt-3 grid gap-3 text-sm sm:grid-cols-3">
              <div><dt className="text-muted">Amount due</dt><dd className="m-0 font-mono font-bold">{formatPHP(b.downpaymentRequired)}</dd></div>
              <div><dt className="text-muted">Reference</dt><dd className="m-0 font-mono">{b.payment.reference ?? '—'}</dd></div>
              <div><dt className="text-muted">Proof file (name only)</dt><dd className="m-0">{b.payment.proofFileName ?? '—'}</dd></div>
            </dl>
            <p className="mt-3 text-xs text-muted">Demo: there is no GCash account to check against. Verifying here only changes mock data.</p>
            {b.status === 'awaiting_verification' && (
              <div className="mt-4 flex flex-wrap items-end gap-3 border-t border-slate pt-4">
                <AdminButton tone="primary" onClick={() => act(adminVerifyAndConfirm(b.id), 'Payment verified and booking confirmed (demo).')}>Verify payment &amp; confirm</AdminButton>
              </div>
            )}
            {(b.status === 'awaiting_verification' || b.status === 'awaiting_payment') && (
              <div className="mt-4 flex flex-wrap items-end gap-3 border-t border-slate pt-4">
                <label className="text-sm">
                  <span className="mb-1 block text-muted">Rejection note (optional)</span>
                  <input className={adminInput} value={note} onChange={(e) => setNote(e.target.value)} placeholder="Shown to the customer" />
                </label>
                <AdminButton onClick={() => act(adminRejectBooking(b.id, note.trim()), 'Booking rejected (demo). Room and gear released.')}>Reject booking (demo)</AdminButton>
              </div>
            )}
            <p className="mt-3 text-xs text-muted">Rejection policy is to be confirmed by the studio; this is a demo action only.</p>
          </section>
          {msg && <Callout tone={msg.ok ? 'success' : 'error'} title={msg.text} />}

          <section aria-labelledby="gear-title" className="border border-slate p-4">
            <h2 id="gear-title" className="font-semibold">Extra gear held</h2>
            {b.selectedEquipment.length === 0 ? <p className="mt-2 text-sm text-muted">None</p> : (
              <ul className="mt-2 text-sm">
                {b.selectedEquipment.map((e) => <li key={e.itemId}>{e.quantity} × {equipmentLabel(e, s.rentals)}</li>)}
              </ul>
            )}
          </section>
        </div>
        <PriceReceipt price={priceFromBooking(b)} title={b.reference} roomLabel={roomName(b.roomId)} />
      </div>
    </>
  )
}
