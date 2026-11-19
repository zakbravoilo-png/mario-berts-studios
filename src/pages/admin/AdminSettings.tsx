import { useState } from 'react'
import { useDemoState } from '../../services/demoStore'
import { adminUpdateSettings } from '../../services/actions'
import { PortalHeader } from '../../components/ui/PortalHeader'
import { Callout } from '../../components/ui/Callout'
import { AdminButton, adminInput } from '../../features/admin/adminUi'
import type { LessonStatus, RehearsalStatus } from '../../types/domain'
import { formatPHP, formatPHPOrTbd } from '../../utils/money'

export function AdminSettings() {
  const s = useDemoState()
  const st = s.settings
  const [gcash, setGcash] = useState(st.gcashInstructions ?? '')
  const [saved, setSaved] = useState(false)
  const holdVerify = st.inventoryHoldStatuses.includes('awaiting_verification')
  const holdLesson = st.lessonRoomHoldStatuses.includes('requested')

  const confirmed: [string, string][] = [
    ['Operating hours', `${st.openTime}–${st.closeTime} (Asia/Manila)`],
    ['Room rate', `${formatPHP(st.roomRatePerHour)} per hour, per room`],
    ['Downpayment', `${Math.round(st.downpaymentRate * 100)}% via GCash; returned manually if cancelled before the booking day, kept on the day`],
    ['Remaining balance', 'Paid after the rehearsal, cash at the studio or GCash (checked manually)'],
    ['Cancellation', 'Only before the day of the booking'],
    ['Live gig streaming', `${formatPHP(st.streamingRatePerHour)} per hour`],
    ['Lesson — beginner', `${formatPHPOrTbd(st.lessonPrices.beginner)} · ${st.lessonDurationMinutes.beginner} min`],
    ['Lesson — intermediate', `${formatPHPOrTbd(st.lessonPrices.intermediate)} · ${st.lessonDurationMinutes.intermediate} min`],
  ]

  return (
    <>
      <PortalHeader title="Business settings" description="Confirmed values are read-only here. Demo assumptions can be changed to try the owner's answers." />
      <section aria-labelledby="conf-title" className="border border-slate p-4">
        <h2 id="conf-title" className="font-semibold">Confirmed (read-only)</h2>
        <dl className="mt-3 grid gap-x-6 gap-y-2 text-sm sm:grid-cols-2">
          {confirmed.map(([k, v]) => <div key={k}><dt className="text-muted">{k}</dt><dd className="m-0">{v}</dd></div>)}
        </dl>
      </section>

      <section aria-labelledby="demo-title" className="mt-6 border border-dashed border-slate p-4">
        <h2 id="demo-title" className="font-semibold">Demo assumptions (owner to confirm)</h2>
        <dl className="mt-3 grid gap-x-6 gap-y-2 text-sm sm:grid-cols-2">
          <div><dt className="text-muted">Rehearsal slot / minimum</dt><dd className="m-0">{st.slotMinutes} min / {st.minBookingHours} hr</dd></div>
          <div><dt className="text-muted">Lesson start increments</dt><dd className="m-0">{st.lessonSlotMinutes} min</dd></div>
          <div><dt className="text-muted">Turnaround buffer</dt><dd className="m-0">None (not specified)</dd></div>
          <div><dt className="text-muted">Same-day booking</dt><dd className="m-0">Allowed (not specified)</dd></div>
        </dl>
        <div className="mt-5 space-y-3 text-sm">
          <label className="flex items-start gap-2">
            <input type="checkbox" className="mt-0.5 size-4 accent-[var(--color-rust)]" checked={holdVerify}
              onChange={(e) => adminUpdateSettings({ inventoryHoldStatuses: (e.target.checked ? ['awaiting_verification', 'confirmed'] : ['confirmed']) as RehearsalStatus[] })} />
            <span>Hold the room and shared gear while a booking is <strong>awaiting payment verification</strong>. <span className="text-muted">(Safer default: prevents double-booking.)</span></span>
          </label>
          <label className="flex items-start gap-2">
            <input type="checkbox" className="mt-0.5 size-4 accent-[var(--color-rust)]" checked={holdLesson}
              onChange={(e) => adminUpdateSettings({ lessonRoomHoldStatuses: (e.target.checked ? ['requested', 'confirmed'] : ['confirmed']) as LessonStatus[] })} />
            <span>Hold the room while a <strong>lesson request</strong> is pending.</span>
          </label>
        </div>
      </section>

      <section aria-labelledby="gc-title" className="mt-6 border border-slate p-4">
        <h2 id="gc-title" className="font-semibold">GCash payment instructions</h2>
        <p className="mt-1 text-sm text-muted">Shown to customers at checkout. Leave blank to show “GCash details to be provided by studio”. Don&apos;t put real account details into this demo.</p>
        <textarea className={`${adminInput} mt-3 w-full`} rows={3} value={gcash} onChange={(e) => { setGcash(e.target.value); setSaved(false) }} aria-label="GCash payment instructions" />
        <AdminButton className="mt-3" tone="primary" onClick={() => { adminUpdateSettings({ gcashInstructions: gcash.trim() || null }); setSaved(true) }}>Save instructions</AdminButton>
        {saved && <Callout tone="success" title="Saved (demo)" className="mt-3" />}
      </section>
    </>
  )
}
