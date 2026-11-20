import { useCallback, useMemo, useState, type FormEvent } from 'react'
import { Link, useSearchParams } from 'react-router'
import { ArrowRight, Check, Info } from 'lucide-react'
import type { RentalEquipmentId } from '../../types/domain'
import { availabilityContext, rentalsWithStock, useDemoState } from '../../services/demoStore'
import { createRehearsalBooking } from '../../services/actions'
import { availableQty, isRoomFree, maxHoursFrom } from './availability'
import { priceRehearsal } from './pricing'
import { ScheduleGrid } from './ScheduleGrid'
import { FlowNav, FlowShell } from './FlowShell'
import { PriceReceipt } from './ExampleReceipt'
import { PolicyNotice } from './PolicyNotice'
import { CustomerFields } from './CustomerFields'
import { emptyCustomer, validateCustomer, type CustomerErrors, type CustomerForm } from './customerSchema'
import { SentMessages } from './SentMessages'
import { useSessionDraft } from './useSessionDraft'
import { findCustomerByPhone, useCurrentCustomer } from '../../services/accounts'
import { useNow } from './useNow'
import { ReservationTicket } from './ReservationTicket'
import { DuotoneImage } from '../../components/grunge'
import { Callout } from '../../components/ui/Callout'
import { TextField } from '../../components/ui/Field'
import { ConfirmDialog } from '../../components/ui/ConfirmDialog'
import { QtyStepper } from '../../components/ui/QtyStepper'
import { includedEquipment, roomName } from '../../data/rooms'
import type { PhotoKey } from '../../data/photos'
import { formatPHP } from '../../utils/money'
import { addDays, addMinutes, formatDate, formatMinutes, formatRange, manilaIso, minutesToHhmm, todayManila, type DateKey } from '../../utils/time'

const STEPS = ['Date & time', 'Room', 'Duration', 'Extra gear', 'Your details', 'Review & pay', 'Confirmed']

interface Draft {
  step: number
  date: DateKey
  roomId: string | null
  startMin: number | null
  hours: number
  equipment: Partial<Record<RentalEquipmentId, number>>
  details: CustomerForm
  gcashRef: string
  proofFileName: string | null
  bookingId: string | null
}

export function RehearsalBookingFlow({ mode = 'portal' }: { mode?: 'portal' | 'guest' | 'admin' }) {
  const guest = mode === 'guest'
  /** Studio staff booking on behalf of a customer. */
  const admin = mode === 'admin'
  const s = useDemoState()
  const me = useCurrentCustomer()
  const ctx = useMemo(() => availabilityContext(s), [s])
  const now = useNow()
  const [params] = useSearchParams()
  const initial = useCallback(
    (): Draft => ({
      step: 0,
      date: todayManila(),
      roomId: params.get('room'),
      startMin: null,
      hours: 1,
      equipment: {},
      details: guest || admin || !me ? emptyCustomer() : { name: me.name, email: me.email, phone: me.phone, bandName: me.bandName ?? '', notes: '' },
      gcashRef: '',
      proofFileName: null,
      bookingId: null,
    }),
    // eslint-disable-next-line react-hooks/exhaustive-deps -- initial values only
    [],
  )
  const [d, update, clear] = useSessionDraft<Draft>(admin ? 'admin-rehearsal-draft' : guest ? 'guest-rehearsal-draft' : 'rehearsal-draft', initial)
  const [errors, setErrors] = useState<CustomerErrors>({})
  const [stepError, setStepError] = useState<string | null>(null)
  const [submitErrors, setSubmitErrors] = useState<string[]>([])
  /** Which confirmation prompt is open on the review step. */
  const [confirming, setConfirming] = useState<null | 'pay' | 'later'>(null)

  const today = todayManila(now)
  const startAt = d.startMin !== null ? manilaIso(d.date, minutesToHhmm(d.startMin)) : null
  const endAt = startAt ? addMinutes(startAt, d.hours * 60) : null
  const range = startAt && endAt ? { startAt, endAt } : null
  const maxHours = startAt && d.roomId ? maxHoursFrom(d.roomId, startAt, ctx) : 0
  const rentals = rentalsWithStock(s).filter((r) => r.active)
  const selections = Object.entries(d.equipment)
    .filter(([, q]) => (q ?? 0) > 0)
    .map(([itemId, quantity]) => ({ itemId: itemId as RentalEquipmentId, quantity: quantity ?? 0 }))
  const price = priceRehearsal(d.hours, selections, s.settings.roomRatePerHour, s.settings.downpaymentRate, s.rentals)
  const booking = d.bookingId ? s.bookings.find((b) => b.id === d.bookingId) : undefined

  const go = (step: number) => {
    setStepError(null)
    setSubmitErrors([])
    update({ step })
  }

  // ── step validation ──
  function next() {
    if (d.step === 0 && (d.startMin === null || !d.roomId)) return setStepError('Pick a vacant time slot in the grid to continue.')
    if (d.step === 1 && (!d.roomId || !startAt || !isRoomFree(d.roomId, { startAt, endAt: addMinutes(startAt, s.settings.slotMinutes) }, ctx)))
      return setStepError('Choose a room that is vacant at your start time.')
    if (d.step === 2 && (d.hours < 1 || d.hours > maxHours)) return setStepError(`Choose between 1 and ${maxHours} hour(s).`)
    if (d.step === 3 && range) {
      const over = selections.find((x) => x.quantity > availableQty(x.itemId, range, ctx))
      if (over) return setStepError('Some extra gear is no longer available in that quantity. Please adjust.')
    }
    if (d.step === 4) {
      const e = validateCustomer(d.details)
      setErrors(e)
      if (Object.keys(e).length) return setStepError('Please fix the highlighted fields.')
    }
    go(d.step + 1)
  }

  function pickSlot(roomId: string, startMin: number) {
    setStepError(null)
    const sa = manilaIso(d.date, minutesToHhmm(startMin))
    const max = maxHoursFrom(roomId, sa, ctx)
    update({ roomId, startMin, hours: Math.max(1, Math.min(d.hours, max)) })
  }

  function setRoom(roomId: string) {
    if (!startAt) return
    const max = maxHoursFrom(roomId, startAt, ctx)
    update({ roomId, hours: Math.max(1, Math.min(d.hours, max)) })
  }

  function setHours(hours: number) {
    if (!startAt) return
    const r = { startAt, endAt: addMinutes(startAt, hours * 60) }
    // clamp gear to what's free for the new range
    const eq: Draft['equipment'] = {}
    for (const [k, q] of Object.entries(d.equipment)) eq[k as RentalEquipmentId] = Math.min(q ?? 0, availableQty(k as RentalEquipmentId, r, ctx))
    update({ hours, equipment: eq })
  }

  /** Open the confirmation prompt (payment needs a GCash reference first). */
  function askToConfirm(kind: 'pay' | 'later') {
    setSubmitErrors([])
    if (kind === 'pay' && !d.gcashRef.trim()) return setStepError('Enter your GCash reference number first, or choose “Save and pay later”.')
    setStepError(null)
    setConfirming(kind)
  }

  /** Called only from the confirmation prompt — confirming it is the customer's acknowledgement of the policy. */
  function submit(withPayment: boolean) {
    setConfirming(null)
    setSubmitErrors([])
    if (!d.roomId || !startAt) return
    const r = createRehearsalBooking({
      roomId: d.roomId,
      startAt,
      hours: d.hours,
      equipment: selections,
      customer: {
        name: d.details.name.trim(),
        email: d.details.email.trim(),
        phone: d.details.phone.trim(),
        bandName: d.details.bandName?.trim() || undefined,
        notes: d.details.notes?.trim() || undefined,
      },
      payment: withPayment ? { reference: d.gcashRef.trim(), proofFileName: d.proofFileName } : undefined,
      // Admin: attach to the customer's account if their number has one, otherwise a guest booking.
      customerId: admin ? (findCustomerByPhone(s.customers, d.details.phone)?.id ?? 'guest') : guest || !me ? 'guest' : me.id,
    })
    if (!r.ok) {
      setSubmitErrors(r.errors)
      return
    }
    setStepError(null)
    update({ step: 6, bookingId: r.value.id })
  }

  const summary =
    d.step >= 1 && d.step < 6 && range && d.roomId ? (
      <div className="space-y-4">
        <div className="border border-slate bg-ink p-4 text-sm">
          <p className="eyebrow text-muted">Your booking</p>
          <p className="mt-2 font-semibold">{roomName(d.roomId)}</p>
          <p>{formatDate(range.startAt)}</p>
          <p>{formatRange(range.startAt, range.endAt)}</p>
        </div>
        {d.step >= 2 && <PriceReceipt price={price} roomLabel={roomName(d.roomId)} />}
      </div>
    ) : undefined

  // ── step bodies ──
  let body: React.ReactNode = null
  if (d.step === 0) {
    const dates = Array.from({ length: 7 }, (_, i) => addDays(today, i))
    body = (
      <>
        <p className="text-muted">Choose a date, then a vacant start time in any room. Times are Asia/Manila; the studio is open 9:00 AM – 9:00 PM.</p>
        <div className="mt-5 flex flex-wrap items-end gap-3">
          <div role="group" aria-label="Quick date picks" className="flex flex-wrap gap-2">
            {dates.map((dk, i) => (
              <button
                key={dk}
                type="button"
                aria-pressed={d.date === dk}
                onClick={() => update({ date: dk, startMin: null })}
                className={`min-h-11 border-2 px-3 py-1.5 text-sm ${d.date === dk ? 'border-paper bg-paper font-semibold text-ink' : 'border-slate text-paper hover:border-paper'}`}
              >
                {i === 0 ? 'Today' : i === 1 ? 'Tomorrow' : formatDate(dk).split(',')[0]}
                <span className="block text-xs">{formatDate(dk).replace(/^\w+, /, '').replace(/,? \d{4}$/, '')}</span>
              </button>
            ))}
          </div>
          <TextField
            label="Or pick a date"
            type="date"
            min={today}
            value={d.date}
            onChange={(e) => e.target.value && update({ date: e.target.value, startMin: null })}
            className="w-48"
          />
        </div>
        <p className="mt-6 font-semibold" aria-live="polite">{formatDate(d.date, true)}</p>
        <div className="mt-3">
          <ScheduleGrid
            date={d.date}
            ctx={ctx}
            now={now}
            selected={d.roomId && d.startMin !== null ? { roomId: d.roomId, startMin: d.startMin } : null}
            onSelect={pickSlot}
            caption={`Room availability for ${formatDate(d.date, true)}`}
          />
        </div>
        <p className="mt-3 text-xs text-muted">Bookings start on the hour, 1 hour minimum. You can book on the day if a room is vacant. Demo: availability is mock data, not live.</p>
      </>
    )
  } else if (d.step === 1 && startAt) {
    body = (
      <fieldset>
        <legend className="text-muted">
          Starting {formatMinutes(d.startMin!)} on {formatDate(d.date)}. Every room has the same standard kit.
        </legend>
        <div className="mt-5 grid gap-4 md:grid-cols-3">
          {ctx.rooms.map((room) => {
            const free = isRoomFree(room.id, { startAt, endAt: addMinutes(startAt, s.settings.slotMinutes) }, ctx)
            const sel = d.roomId === room.id
            return (
              <label key={room.id} className={`block cursor-pointer overflow-hidden border-2 bg-ink ${sel ? 'border-paper' : 'border-slate'} ${free ? 'hover:border-paper' : 'cursor-not-allowed opacity-60'}`}>
                <input type="radio" name="room" className="sr-only" checked={sel} disabled={!free} onChange={() => setRoom(room.id)} aria-label={`${room.name}${free ? '' : ' — taken at this time'}`} />
                {room.photo && <DuotoneImage photo={room.photo as PhotoKey} alt="" tone="photo" halftone={false} grain={false} className="aspect-video w-full" sizes="(min-width: 768px) 30vw, 100vw" />}
                <span className="block p-4">
                  <span className="flex flex-col gap-1">
                    <span className="font-display text-2xl tracking-wide whitespace-nowrap">{room.name}</span>
                    <span className="flex items-center gap-1 text-sm font-semibold">
                      {sel ? (<><Check aria-hidden="true" className="size-4" /> Selected</>) : free ? 'Vacant' : 'Taken at this time'}
                    </span>
                  </span>
                </span>
              </label>
            )
          })}
        </div>
        <div className="mt-6 border border-slate p-4">
          <p className="font-semibold">Included in every room — no extra charge</p>
          <ul className="mt-2 grid gap-1 text-sm text-paper/90 sm:grid-cols-2">
            {includedEquipment.map((e) => (
              <li key={e.id} className="flex gap-2"><Check aria-hidden="true" className="mt-0.5 size-4 shrink-0 text-rust-light" />{e.quantity} × {e.name}</li>
            ))}
          </ul>
        </div>
      </fieldset>
    )
  } else if (d.step === 2 && startAt) {
    const options = Array.from({ length: maxHours }, (_, i) => i + 1)
    body = (
      <fieldset>
        <legend className="text-muted">
          {formatPHP(s.settings.roomRatePerHour)} per hour. Bookings must end by 9:00 PM{maxHours < (21 * 60 - d.startMin!) / 60 ? ' and before the next booking in this room' : ''}.
        </legend>
        <div className="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-4">
          {options.map((h) => {
            const sel = d.hours === h
            return (
              <label key={h} className={`cursor-pointer border-2 p-3 ${sel ? 'border-paper bg-paper text-ink' : 'border-slate bg-ink hover:border-paper'}`}>
                <input type="radio" name="hours" className="sr-only" checked={sel} onChange={() => setHours(h)} aria-label={`${h} hour${h > 1 ? 's' : ''}, until ${formatMinutes(d.startMin! + h * 60)}, ${formatPHP(h * s.settings.roomRatePerHour)}`} />
                <span className="block font-display text-2xl">{h} hr{h > 1 ? 's' : ''}</span>
                <span className="block text-xs">until {formatMinutes(d.startMin! + h * 60)}</span>
                <span className="mt-1 block font-mono text-sm font-bold">{formatPHP(h * s.settings.roomRatePerHour)}</span>
                {sel && <span className="sr-only">(selected)</span>}
              </label>
            )
          })}
        </div>
        <p className="mt-3 text-xs text-muted">1 hour minimum. Demo: the maximum is limited only by closing time.</p>
      </fieldset>
    )
  } else if (d.step === 3 && range) {
    body = (
      <>
        <Callout tone="info" title="Charged once per reservation, not per hour">
          Extra gear is shared by all three rooms, so the numbers below are what&apos;s available for {formatRange(range.startAt, range.endAt)} on {formatDate(range.startAt)}. Mock data, not live inventory.
        </Callout>
        <ul className="mt-5 divide-y divide-slate border-y border-slate">
          {rentals.map((r) => {
            const free = availableQty(r.id, range, ctx)
            const q = d.equipment[r.id] ?? 0
            return (
              <li key={r.id} className="flex flex-wrap items-center justify-between gap-4 py-4">
                <div className="min-w-0">
                  <p className="font-semibold">{r.name}</p>
                  <p className="text-sm text-muted">
                    <span className="font-mono text-paper">{formatPHP(r.unitPrice)}</span> {r.pricingUnit === 'per_kit' ? 'per kit' : 'each'} ·{' '}
                    {r.outOfService ? <strong className="text-paper">Out of service</strong> : free === 0 ? <strong className="text-paper">None available at this time</strong> : `${free} of ${r.totalQuantity ?? '?'} available`}
                  </p>
                </div>
                <QtyStepper label={r.shortName} value={q} max={free} onChange={(n) => update({ equipment: { ...d.equipment, [r.id]: n } })} />
              </li>
            )
          })}
        </ul>
      </>
    )
  } else if (d.step === 4) {
    body = (
      <form noValidate onSubmit={(e: FormEvent) => (e.preventDefault(), next())}>
        <CustomerFields value={d.details} errors={errors} onChange={(details) => update({ details })} />
        <button type="submit" className="sr-only">Continue</button>
      </form>
    )
  } else if (d.step === 5 && range && d.roomId) {
    const gcash = s.settings.gcashInstructions
    body = (
      <div className="space-y-6">
        <dl className="grid gap-3 border border-slate bg-ink p-4 text-sm sm:grid-cols-2">
          <div><dt className="text-muted">Room</dt><dd className="m-0 font-semibold">{roomName(d.roomId)}</dd></div>
          <div><dt className="text-muted">When</dt><dd className="m-0 font-semibold">{formatDate(range.startAt)}, {formatRange(range.startAt, range.endAt)}</dd></div>
          <div><dt className="text-muted">Name</dt><dd className="m-0">{d.details.name}{d.details.bandName ? ` · ${d.details.bandName}` : ''}</dd></div>
          <div><dt className="text-muted">Contact</dt><dd className="m-0">{[d.details.email, d.details.phone].filter(Boolean).join(' · ')}</dd></div>
        </dl>
        <div className="max-w-sm lg:hidden"><PriceReceipt price={price} roomLabel={roomName(d.roomId)} /></div>
        <PolicyNotice downpaymentRate={s.settings.downpaymentRate} />
        <section aria-labelledby="gcash-title" className="border-2 border-dashed border-slate p-5">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <h3 id="gcash-title" className="font-display text-xl tracking-wide">Pay the downpayment via GCash</h3>
            <span className="demo-chip">Checked manually by the studio</span>
          </div>
          <p className="mt-2 text-sm">Amount: <strong className="font-mono">{formatPHP(price.downpayment)}</strong> (50% of {formatPHP(price.total)})</p>
          <div className="mt-3 border border-slate bg-ink p-3 text-sm">
            {gcash ? <p className="whitespace-pre-line">{gcash}</p> : <p className="font-semibold">GCash details to be provided by studio.</p>}
          </div>
          <ol className="mt-3 list-decimal space-y-1 pl-5 text-sm text-paper/90">
            <li>Send <strong className="font-mono">{formatPHP(price.downpayment)}</strong> using your GCash app.</li>
            <li>Enter the GCash reference number below (and attach the receipt if you can).</li>
            <li>The studio checks the payment by hand and confirms your booking.</li>
          </ol>
          <p className="mt-3 text-xs text-muted">Prototype: nothing is sent or charged here. Enter a made-up reference to try the flow — never a real one.</p>
          <div className="mt-4 grid gap-4 sm:grid-cols-2">
            <TextField label="GCash reference number" value={d.gcashRef} onChange={(e) => update({ gcashRef: e.target.value })} placeholder="e.g. DEMO-123456" autoComplete="off" />
            <TextField
              label="GCash receipt screenshot"
              type="file"
              accept="image/*,.pdf"
              optional
              hint={d.proofFileName ? `Selected: ${d.proofFileName} (not uploaded)` : 'Only the file name is kept; nothing is uploaded.'}
              onChange={(e) => update({ proofFileName: e.target.files?.[0]?.name ?? null })}
            />
          </div>
        </section>
        {submitErrors.length > 0 && (
          <Callout tone="error" title="This booking can't be made">
            <ul className="list-disc pl-5">{submitErrors.map((m) => <li key={m}>{m}</li>)}</ul>
            <button type="button" className="mt-2 underline" onClick={() => go(0)}>Pick another time</button>
          </Callout>
        )}
      </div>
    )
  } else if (d.step === 6) {
    body = booking ? (
      <div className="space-y-6">
        {booking.status === 'awaiting_verification' ? (
          <Callout tone="success" title="Submitted — awaiting payment verification">
            Your booking is NOT confirmed yet. The studio checks the GCash downpayment, then confirms. The room and gear are held for you meanwhile (demo setting).
          </Callout>
        ) : booking.status === 'awaiting_payment' ? (
          <Callout tone="warning" title="Saved — awaiting payment">
            Your booking is NOT confirmed and the room is NOT held until you send the GCash downpayment reference from your reservation page.
          </Callout>
        ) : (
          <Callout tone="info" title={`This booking is now: ${booking.status.replace(/_/g, ' ')}`}>
            See your reservation page for details.
          </Callout>
        )}
        <ReservationTicket booking={booking} />
        <SentMessages reference={booking.reference} latestOnly />
        {(guest || admin) && (
          <Callout tone="info" title={admin ? `Give the customer this reference: ${booking.reference}` : `Keep your reference: ${booking.reference}`}>
            {admin
              ? booking.customerId === 'guest'
                ? 'Saved as a guest booking. The customer can look it up with Find my booking using this reference and their contact number.'
                : 'Linked to the customer’s account (matched by contact number) — it shows in their portal.'
              : <>No account needed. To check, pay or cancel later, use <strong>Find my booking</strong> with this reference and your contact number.</>}
          </Callout>
        )}
        <div className="flex flex-wrap gap-4">
          <Link to={admin ? `/admin/bookings/${booking.reference}` : guest ? `/my-booking?ref=${booking.reference}` : `/portal/reservations/${booking.reference}`} className="btn btn-primary">
            {admin ? 'Open booking details' : 'View booking'} <ArrowRight aria-hidden="true" className="size-5" />
          </Link>
          <button type="button" className="btn btn-ghost" onClick={clear}>Book another room</button>
        </div>
      </div>
    ) : (
      <Callout tone="info" title="No booking to show">
        <button type="button" className="underline" onClick={clear}>Start a new booking</button>
      </Callout>
    )
  }

  // Guard: a step needs earlier choices (e.g. after a reset).
  if (!body) {
    body = (
      <Callout tone="info" title="Let's start from the top">
        <button type="button" className="underline" onClick={() => go(0)}>Choose a date and time</button>
      </Callout>
    )
  }

  const nextButton =
    d.step < 5 ? (
      <button type="button" className="btn btn-primary" onClick={next}>
        Continue <ArrowRight aria-hidden="true" className="size-5" />
      </button>
    ) : d.step === 5 ? (
      <div className="flex flex-wrap gap-3">
        <button type="button" className="btn btn-ghost" onClick={() => askToConfirm('later')}>Save and pay later</button>
        <button type="button" className="btn btn-primary" onClick={() => askToConfirm('pay')}>
          Confirm downpayment and proceed to book <ArrowRight aria-hidden="true" className="size-5" />
        </button>
      </div>
    ) : null

  return (
    <FlowShell
      title="Book a rehearsal room"
      eyebrow={admin ? 'Booking for a customer · admin · demo' : guest ? 'Rehearsal booking · no account needed · demo' : 'Rehearsal booking · demo'}
      steps={STEPS}
      step={d.step}
      onStepClick={d.step < 6 ? go : undefined}
      stepTitle={STEPS[d.step] ?? ''}
      aside={summary}
    >
      {body}
      {stepError && (
        <p role="alert" className="mt-5 flex items-start gap-2 text-sm font-semibold text-rust-light">
          <Info aria-hidden="true" className="mt-0.5 size-4 shrink-0" /> {stepError}
        </p>
      )}
      {d.step < 6 && <FlowNav onBack={d.step > 0 ? () => go(d.step - 1) : undefined} next={nextButton} />}
      {d.step === 5 && range && d.roomId && (
        <ConfirmDialog
          open={confirming !== null}
          title={confirming === 'pay' ? 'Confirm your downpayment' : 'Save without paying?'}
          confirmLabel={confirming === 'pay' ? 'Confirm and book' : 'Save booking'}
          onCancel={() => setConfirming(null)}
          onConfirm={() => submit(confirming === 'pay')}
        >
          <dl className="grid grid-cols-[auto_1fr] gap-x-4 gap-y-1.5">
            <dt className="text-muted">Room</dt><dd className="m-0 font-semibold">{roomName(d.roomId)}</dd>
            <dt className="text-muted">When</dt><dd className="m-0">{formatDate(range.startAt)}, {formatRange(range.startAt, range.endAt)}</dd>
            <dt className="text-muted">Total</dt><dd className="m-0 font-mono">{formatPHP(price.total)}</dd>
            <dt className="text-muted">Downpayment</dt><dd className="m-0 font-mono font-bold">{formatPHP(price.downpayment)} via GCash</dd>
            {confirming === 'pay' && (<><dt className="text-muted">GCash ref.</dt><dd className="m-0 font-mono break-all">{d.gcashRef.trim()}</dd></>)}
            <dt className="text-muted">Balance</dt><dd className="m-0 font-mono">{formatPHP(price.balance)} after your rehearsal (cash or GCash)</dd>
          </dl>
          {confirming === 'pay' ? (
            <ul className="mt-4 list-disc space-y-1 pl-5 marker:text-rust-light">
              <li>Cancel <strong>before the day</strong> of the booking and the {formatPHP(price.downpayment)} downpayment is returned via GCash.</li>
              <li>You can&apos;t cancel on the booking day itself; the downpayment is then kept.</li>
              <li>Your booking is confirmed once the studio checks your GCash payment.</li>
            </ul>
          ) : (
            <ul className="mt-4 list-disc space-y-1 pl-5 marker:text-rust-light">
              <li>The room is <strong>not held</strong> until you send the {formatPHP(price.downpayment)} downpayment reference from your booking page.</li>
              <li>Once paid, cancelling before the booking day gets the downpayment back; no cancellations on the day itself.</li>
            </ul>
          )}
        </ConfirmDialog>
      )}
    </FlowShell>
  )
}
