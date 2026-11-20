import { useCallback, useMemo, useState, type FormEvent } from 'react'
import { Link } from 'react-router'
import { ArrowRight, Check, Info } from 'lucide-react'
import type { LessonLevel, LessonType } from '../../types/domain'
import { availabilityContext, useDemoState } from '../../services/demoStore'
import { createLessonRequest } from '../../services/actions'
import { availableInstructors, firstFreeRoom, lessonSlotOpen, withinOperatingHours } from '../booking/availability'
import { FlowNav, FlowShell } from '../booking/FlowShell'
import { CustomerFields } from '../booking/CustomerFields'
import { emptyCustomer, validateCustomer, type CustomerErrors, type CustomerForm } from '../booking/customerSchema'
import { SentMessages } from '../booking/SentMessages'
import { useSessionDraft } from '../booking/useSessionDraft'
import { useCurrentCustomer } from '../../services/accounts'
import { useNow } from '../booking/useNow'
import { LessonTicket } from '../booking/ReservationTicket'
import { Callout } from '../../components/ui/Callout'
import { TextField } from '../../components/ui/Field'
import { dayNames } from '../../data/instructors'
import { lessonLabel, lessonLevels, lessonTypes, levelLabel } from '../../data/services'
import { roomName } from '../../data/rooms'
import { formatPHPOrTbd } from '../../utils/money'
import { formatDuration } from '../../utils/duration'
import { addDays, addMinutes, formatDate, formatMinutes, formatRange, hhmmToMinutes, manilaIso, minutesToHhmm, toMs, todayManila, type DateKey } from '../../utils/time'

const STEPS = ['Instrument', 'Level', 'Date & time', 'Instructor', 'Your details', 'Review', 'Requested']

interface Draft {
  step: number
  lessonType: LessonType | null
  level: LessonLevel | null
  date: DateKey
  startMin: number | null
  instructorId: string | null
  details: CustomerForm
  lessonId: string | null
}

export function LessonBookingFlow({ mode = 'portal' }: { mode?: 'portal' | 'guest' }) {
  const guest = mode === 'guest'
  const s = useDemoState()
  const me = useCurrentCustomer()
  const ctx = useMemo(() => availabilityContext(s), [s])
  const now = useNow()
  const initial = useCallback(
    (): Draft => ({
      step: 0,
      lessonType: null,
      level: null,
      date: todayManila(),
      startMin: null,
      instructorId: null,
      details: guest || !me ? emptyCustomer() : { name: me.name, email: me.email, phone: me.phone, bandName: '', notes: '' },
      lessonId: null,
    }),
    // eslint-disable-next-line react-hooks/exhaustive-deps -- initial values only
    [],
  )
  const [d, update, clear] = useSessionDraft<Draft>(guest ? 'guest-lesson-draft' : 'lesson-draft', initial)
  const [errors, setErrors] = useState<CustomerErrors>({})
  const [stepError, setStepError] = useState<string | null>(null)
  const [submitErrors, setSubmitErrors] = useState<string[]>([])

  const today = todayManila(now)
  const duration = d.level ? s.settings.lessonDurationMinutes[d.level] : 0
  const startAt = d.startMin !== null ? manilaIso(d.date, minutesToHhmm(d.startMin)) : null
  const range = startAt && duration ? { startAt, endAt: addMinutes(startAt, duration) } : null
  const instructors = d.lessonType && d.level && range ? availableInstructors(d.lessonType, d.level, range, ctx) : []
  const room = range ? firstFreeRoom(range, ctx) : null
  const lesson = d.lessonId ? s.lessons.find((l) => l.id === d.lessonId) : undefined
  const instName = (id: string | null) => s.instructors.find((i) => i.id === id)?.displayName ?? '—'

  const go = (step: number) => {
    setStepError(null)
    setSubmitErrors([])
    update({ step })
  }

  function next() {
    if (d.step === 0 && !d.lessonType) return setStepError('Choose an instrument.')
    if (d.step === 1 && !d.level) return setStepError('Choose a level.')
    if (d.step === 2 && (!range || !lessonSlotOpen(d.lessonType!, d.level!, range, ctx).open)) return setStepError('Pick an open start time.')
    if (d.step === 3 && (!d.instructorId || !instructors.some((i) => i.id === d.instructorId))) return setStepError('Choose an available instructor.')
    if (d.step === 4) {
      const e = validateCustomer(d.details)
      setErrors(e)
      if (Object.keys(e).length) return setStepError('Please fix the highlighted fields.')
    }
    go(d.step + 1)
  }

  function submit() {
    if (!range || !d.lessonType || !d.level || !d.instructorId || !room) return setStepError('Something changed — please pick the time again.')
    const r = createLessonRequest({
      lessonType: d.lessonType,
      level: d.level,
      startAt: range.startAt,
      instructorId: d.instructorId,
      roomId: room.id,
      customer: { name: d.details.name.trim(), email: d.details.email.trim(), phone: d.details.phone.trim(), notes: d.details.notes?.trim() || undefined },
      customerId: guest || !me ? 'guest' : me.id,
    })
    if (!r.ok) return setSubmitErrors(r.errors)
    setStepError(null)
    update({ step: 6, lessonId: r.value.id })
  }

  const radioCard = (sel: boolean) => `cursor-pointer border-2 p-4 ${sel ? 'border-paper bg-paper text-ink' : 'border-slate bg-ink hover:border-paper'}`

  let body: React.ReactNode = null
  if (d.step === 0) {
    body = (
      <fieldset>
        <legend className="text-muted">One-on-one lessons. Same price for every instrument.</legend>
        <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-3">
          {lessonTypes.map((t) => (
            <label key={t.id} className={radioCard(d.lessonType === t.id)}>
              <input type="radio" name="instrument" className="sr-only" checked={d.lessonType === t.id} onChange={() => update({ lessonType: t.id, instructorId: null, startMin: null })} aria-label={t.label} />
              <span className="flex items-center justify-between font-display text-2xl tracking-wide">
                {t.label}
                {d.lessonType === t.id && <Check aria-label="selected" className="size-5" />}
              </span>
            </label>
          ))}
        </div>
      </fieldset>
    )
  } else if (d.step === 1) {
    body = (
      <fieldset>
        <legend className="text-muted">The level tells the instructor what to teach. Each booking is one session.</legend>
        <div className="mt-4 grid gap-3 sm:grid-cols-2">
          {lessonLevels.map((l) => (
            <label key={l.id} className={radioCard(d.level === l.id)}>
              <input type="radio" name="level" className="sr-only" checked={d.level === l.id} onChange={() => update({ level: l.id, instructorId: null, startMin: null })} aria-label={`${l.label}, ${formatDuration(s.settings.lessonDurationMinutes[l.id])}, ${formatPHPOrTbd(s.settings.lessonPrices[l.id])}`} />
              <span className="flex items-center justify-between font-display text-2xl tracking-wide">
                {l.label}
                {d.level === l.id && <Check aria-label="selected" className="size-5" />}
              </span>
              <span className="mt-1 block text-sm">{formatDuration(s.settings.lessonDurationMinutes[l.id])} session</span>
              <span className="mt-1 block font-mono font-bold">{formatPHPOrTbd(s.settings.lessonPrices[l.id])}</span>
            </label>
          ))}
        </div>
      </fieldset>
    )
  } else if (d.step === 2 && d.lessonType && d.level) {
    const dates = Array.from({ length: 7 }, (_, i) => addDays(today, i))
    const open = hhmmToMinutes(s.settings.openTime)
    const close = hhmmToMinutes(s.settings.closeTime)
    const starts: number[] = []
    for (let m = open; m + duration <= close; m += s.settings.lessonSlotMinutes) starts.push(m)
    body = (
      <>
        <p className="text-muted">
          {levelLabel(d.level)} {lessonLabel(d.lessonType).toLowerCase()} · {formatDuration(duration)}. A time is open only when an instructor <em>and</em> a room are free.
        </p>
        <div className="mt-4 flex flex-wrap items-end gap-3">
          <div role="group" aria-label="Quick date picks" className="flex flex-wrap gap-2">
            {dates.map((dk, i) => (
              <button key={dk} type="button" aria-pressed={d.date === dk} onClick={() => update({ date: dk, startMin: null, instructorId: null })}
                className={`min-h-11 border-2 px-3 py-1.5 text-sm ${d.date === dk ? 'border-paper bg-paper font-semibold text-ink' : 'border-slate hover:border-paper'}`}>
                {i === 0 ? 'Today' : i === 1 ? 'Tomorrow' : formatDate(dk).split(',')[0]}
                <span className="block text-xs">{formatDate(dk).replace(/^\w+, /, '').replace(/,? \d{4}$/, '')}</span>
              </button>
            ))}
          </div>
          <TextField label="Or pick a date" type="date" min={today} value={d.date} onChange={(e) => e.target.value && update({ date: e.target.value, startMin: null, instructorId: null })} className="w-48" />
        </div>
        <p className="mt-6 font-semibold">{formatDate(d.date, true)}</p>
        <ul className="mt-3 grid grid-cols-2 gap-2 sm:grid-cols-4 lg:grid-cols-6" aria-label="Start times">
          {starts.map((m) => {
            const sa = manilaIso(d.date, minutesToHhmm(m))
            const r = { startAt: sa, endAt: addMinutes(sa, duration) }
            const past = toMs(sa) < now
            const slot = !past && withinOperatingHours(r, s.settings) ? lessonSlotOpen(d.lessonType!, d.level!, r, ctx) : null
            const isOpen = !!slot?.open
            const reason = past ? 'Past' : !slot ? 'Closed' : slot.instructors.length === 0 ? 'No instructor' : !slot.room ? 'No room free' : `${slot.instructors.length} instructor${slot.instructors.length > 1 ? 's' : ''}`
            const sel = d.startMin === m
            return (
              <li key={m}>
                <button
                  type="button"
                  disabled={!isOpen}
                  aria-pressed={sel}
                  onClick={() => update({ startMin: m, instructorId: null })}
                  className={`w-full border-2 px-2 py-2 text-left ${sel ? 'border-paper bg-paper text-ink' : isOpen ? 'border-slate bg-ink hover:border-paper' : 'cursor-not-allowed border-transparent bg-charcoal text-muted'}`}
                >
                  <span className="block font-mono text-sm font-bold">{formatMinutes(m)}</span>
                  <span className="block text-xs">{sel ? 'Selected' : reason}</span>
                </button>
              </li>
            )
          })}
        </ul>
        {starts.every((m) => toMs(manilaIso(d.date, minutesToHhmm(m))) < now) && <p className="mt-3 text-sm text-muted">No times left today — pick another date.</p>}
        <p className="mt-3 text-xs text-muted">Demo settings: {s.settings.lessonSlotMinutes}-minute start times. Availability is mock data.</p>
      </>
    )
  } else if (d.step === 3 && range) {
    body =
      instructors.length === 0 ? (
        <Callout tone="info" title="No instructor is free for that time">
          Please <button type="button" className="underline" onClick={() => go(2)}>pick another time</button>.
        </Callout>
      ) : (
        <fieldset>
          <legend className="text-muted">Instructors who teach {lessonLabel(d.lessonType!).toLowerCase()} at {levelLabel(d.level!).toLowerCase()} level and are free {formatRange(range.startAt, range.endAt)}.</legend>
          <div className="mt-4 grid gap-3 sm:grid-cols-2">
            {instructors.map((i) => (
              <label key={i.id} className={radioCard(d.instructorId === i.id)}>
                <input type="radio" name="instructor" className="sr-only" checked={d.instructorId === i.id} onChange={() => update({ instructorId: i.id })} aria-label={`${i.displayName} (demo)`} />
                <span className="flex items-center justify-between gap-2">
                  <span className="font-semibold">{i.displayName}</span>
                  <span className="demo-chip">Demo</span>
                </span>
                <span className="mt-1 block text-sm">Teaches {i.instruments.map(lessonLabel).join(', ')} · {i.levels.map(levelLabel).join(' & ')}</span>
                <span className="mt-1 block text-xs">Usually in: {[...new Set(i.weeklyAvailability.map((w) => dayNames[w.day]))].join(', ')}</span>
              </label>
            ))}
          </div>
        </fieldset>
      )
  } else if (d.step === 4) {
    body = (
      <form noValidate onSubmit={(e: FormEvent) => (e.preventDefault(), next())}>
        <CustomerFields value={d.details} errors={errors} onChange={(details) => update({ details })} showBand={false} notesLabel="Experience or goals" />
        <button type="submit" className="sr-only">Continue</button>
      </form>
    )
  } else if (d.step === 5 && range && d.lessonType && d.level) {
    body = (
      <div className="space-y-5">
        <dl className="grid gap-3 border border-slate bg-ink p-4 text-sm sm:grid-cols-2">
          <div><dt className="text-muted">Lesson</dt><dd className="m-0 font-semibold">{lessonLabel(d.lessonType)} · {levelLabel(d.level)}</dd></div>
          <div><dt className="text-muted">When</dt><dd className="m-0 font-semibold">{formatDate(range.startAt)}, {formatRange(range.startAt, range.endAt)}</dd></div>
          <div><dt className="text-muted">Instructor</dt><dd className="m-0">{instName(d.instructorId)} (demo)</dd></div>
          <div><dt className="text-muted">Room (assigned)</dt><dd className="m-0">{room ? roomName(room.id) : 'No room free — pick another time'}</dd></div>
          <div><dt className="text-muted">Price</dt><dd className="m-0 font-mono font-bold">{formatPHPOrTbd(s.settings.lessonPrices[d.level])} per session</dd><dd className="m-0 text-xs text-muted">Paid in full on the day</dd></div>
          <div><dt className="text-muted">Contact</dt><dd className="m-0">{d.details.name} · {[d.details.email, d.details.phone].filter(Boolean).join(' · ')}</dd></div>
        </dl>
        <Callout tone="info" title="Request, not a confirmed booking">
          The studio will confirm your lesson. You pay the full lesson fee on the day, at the studio. Nothing is paid online. You can cancel up to the day before, but not on the lesson day.
        </Callout>
        {submitErrors.length > 0 && (
          <Callout tone="error" title="This lesson can't be requested">
            <ul className="list-disc pl-5">{submitErrors.map((m) => <li key={m}>{m}</li>)}</ul>
            <button type="button" className="mt-2 underline" onClick={() => go(2)}>Pick another time</button>
          </Callout>
        )}
      </div>
    )
  } else if (d.step === 6) {
    body = lesson ? (
      <div className="space-y-6">
        <Callout tone="success" title="Request sent — awaiting studio response">Your room is held while the request is pending (demo setting).</Callout>
        <LessonTicket lesson={lesson} instructorName={instName(lesson.instructorId)} />
        <SentMessages reference={lesson.reference} latestOnly />
        {guest && (
          <Callout tone="info" title={`Keep your reference: ${lesson.reference}`}>
            No account needed. Use <strong>Find my booking</strong> with this reference and your contact number to check on it.
          </Callout>
        )}
        <div className="flex flex-wrap gap-4">
          <Link to={guest ? `/my-booking?ref=${lesson.reference}` : `/portal/reservations/${lesson.reference}`} className="btn btn-primary">View request <ArrowRight aria-hidden="true" className="size-5" /></Link>
          <button type="button" className="btn btn-ghost" onClick={clear}>Request another lesson</button>
        </div>
      </div>
    ) : (
      <Callout tone="info" title="No request to show"><button type="button" className="underline" onClick={clear}>Start again</button></Callout>
    )
  }
  if (!body) body = <Callout tone="info" title="Let's start from the top"><button type="button" className="underline" onClick={() => go(0)}>Choose an instrument</button></Callout>

  const aside =
    d.step >= 1 && d.step < 6 && d.lessonType ? (
      <div className="border border-slate bg-ink p-4 text-sm">
        <p className="eyebrow text-muted">Your lesson</p>
        <p className="mt-2 font-semibold">{lessonLabel(d.lessonType)}{d.level ? ` · ${levelLabel(d.level)}` : ''}</p>
        {d.level && <p>{formatDuration(duration)} · {formatPHPOrTbd(s.settings.lessonPrices[d.level])}</p>}
        {range && <p className="mt-2">{formatDate(range.startAt)}<br />{formatRange(range.startAt, range.endAt)}</p>}
        {d.instructorId && <p className="mt-2">{instName(d.instructorId)} (demo)</p>}
        {range && room && <p className="mt-2 text-muted">Room: {roomName(room.id)} (auto-assigned)</p>}
      </div>
    ) : undefined

  return (
    <FlowShell title="Request a lesson" eyebrow={guest ? 'Lesson request · no account needed · demo' : 'Lesson request · demo'} steps={STEPS} step={d.step} onStepClick={d.step < 6 ? go : undefined} stepTitle={STEPS[d.step] ?? ''} aside={aside}>
      {body}
      {stepError && (
        <p role="alert" className="mt-5 flex items-start gap-2 text-sm font-semibold text-rust-light">
          <Info aria-hidden="true" className="mt-0.5 size-4 shrink-0" /> {stepError}
        </p>
      )}
      {d.step < 6 && (
        <FlowNav
          onBack={d.step > 0 ? () => go(d.step - 1) : undefined}
          next={
            d.step < 5 ? (
              <button type="button" className="btn btn-primary" onClick={next}>Continue <ArrowRight aria-hidden="true" className="size-5" /></button>
            ) : (
              <button type="button" className="btn btn-primary" onClick={submit}>Send request <ArrowRight aria-hidden="true" className="size-5" /></button>
            )
          }
        />
      )}
    </FlowShell>
  )
}
