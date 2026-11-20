import { useId, useMemo, useState } from 'react'
import { CalendarClock } from 'lucide-react'
import type { RehearsalBooking } from '../../types/domain'
import { availabilityContext, useDemoState } from '../../services/demoStore'
import { rescheduleBooking } from '../../services/actions'
import { rescheduleBlockedReason, type RescheduledBy } from './reschedule'
import { validateRehearsalRequest } from './availability'
import { ScheduleGrid } from './ScheduleGrid'
import { useNow } from './useNow'
import { Callout } from '../../components/ui/Callout'
import { TextField } from '../../components/ui/Field'
import { roomName } from '../../data/rooms'
import { addDays, addMinutes, dateKeyOf, formatDate, formatRange, manilaIso, minutesToHhmm, todayManila, toMs, type DateKey } from '../../utils/time'

/**
 * Move a booking to another time or room (same length, same price).
 * Customers until the end of the day before the booking; studio staff until it starts.
 * Used on the customer's booking page and in the admin booking details.
 */
export function ReschedulePanel({ booking: b, by }: { booking: RehearsalBooking; by: RescheduledBy }) {
  const s = useDemoState()
  const now = useNow(30_000)
  const titleId = useId()
  const [open, setOpen] = useState(false)
  const [date, setDate] = useState<DateKey>(() => dateKeyOf(b.startAt))
  const [pick, setPick] = useState<{ roomId: string; startMin: number } | null>(null)
  const [msg, setMsg] = useState<{ ok: boolean; text: string } | null>(null)

  const isStaff = by === 'studio'
  const blocked = rescheduleBlockedReason(b, by, now)
  const minutes = (toMs(b.endAt) - toMs(b.startAt)) / 60_000
  const hours = minutes / 60

  // The schedule without this booking, so its own slot shows as vacant.
  const ctx = useMemo(() => {
    const full = availabilityContext(s)
    return { ...full, bookings: full.bookings.filter((x) => x.id !== b.id) }
  }, [s, b.id])

  const today = todayManila(now)
  const dates = Array.from({ length: 7 }, (_, i) => addDays(today, i))
  const startAt = pick ? manilaIso(date, minutesToHhmm(pick.startMin)) : null
  const endAt = startAt ? addMinutes(startAt, minutes) : null
  const issues = pick && startAt && endAt
    ? validateRehearsalRequest(
        { roomId: pick.roomId, startAt, endAt, equipment: b.selectedEquipment.map((e) => ({ itemId: e.itemId, quantity: e.quantity })) },
        ctx,
        { now },
      )
    : []
  const unchanged = pick && startAt ? pick.roomId === b.roomId && toMs(startAt) === toMs(b.startAt) : false

  function move() {
    if (!pick || !startAt) return
    const r = rescheduleBooking(b.id, { roomId: pick.roomId, startAt }, by)
    if (r.ok) {
      setMsg({ ok: true, text: `Moved to ${roomName(pick.roomId)}, ${formatDate(startAt)}, ${formatRange(startAt, endAt!)}. ${isStaff ? 'Customer notified (demo).' : 'We’ve sent you the new details (demo).'}` })
      setPick(null)
      setOpen(false)
    } else setMsg({ ok: false, text: r.errors.join(' ') })
  }

  const box = isStaff ? 'border border-slate p-4' : 'border border-slate p-5'
  const heading = isStaff ? 'font-semibold' : 'font-display text-xl tracking-wide'

  return (
    <section aria-labelledby={titleId} className={box}>
      <h2 id={titleId} className={heading}>Reschedule</h2>
      {blocked ? (
        <p className="mt-2 text-sm text-muted">{blocked}</p>
      ) : !open ? (
        <>
          <p className="mt-2 text-sm text-paper/90">
            {isStaff
              ? 'Move this booking to another time or room. Same length and price; the downpayment and balance stay the same.'
              : 'Need a different time? Move your booking up to the day before it. It keeps the same length and price, and your downpayment carries over.'}
          </p>
          <button type="button" className={isStaff ? 'mt-3 inline-flex min-h-9 items-center gap-1.5 border border-slate px-3 text-sm font-semibold hover:border-paper' : 'btn btn-ghost mt-4'} onClick={() => { setOpen(true); setMsg(null) }}>
            <CalendarClock aria-hidden="true" className="size-4" /> Choose a new time…
          </button>
        </>
      ) : (
        <div className="mt-3 space-y-4">
          <p className="text-sm text-paper/90">
            Now: <strong>{roomName(b.roomId)}, {formatDate(b.startAt)}, {formatRange(b.startAt, b.endAt)}</strong>. Pick a new vacant start time for {hours} {hours === 1 ? 'hour' : 'hours'}.
          </p>
          <div className="flex flex-wrap items-end gap-3">
            <div role="group" aria-label="Quick date picks" className="flex flex-wrap gap-2">
              {dates.map((dk, i) => (
                <button
                  key={dk}
                  type="button"
                  aria-pressed={date === dk}
                  onClick={() => { setDate(dk); setPick(null) }}
                  className={`min-h-11 border-2 px-3 py-1.5 text-sm ${date === dk ? 'border-paper bg-paper font-semibold text-ink' : 'border-slate text-paper hover:border-paper'}`}
                >
                  {i === 0 ? 'Today' : i === 1 ? 'Tomorrow' : formatDate(dk).split(',')[0]}
                  <span className="block text-xs">{formatDate(dk).replace(/^\w+, /, '').replace(/,? \d{4}$/, '')}</span>
                </button>
              ))}
            </div>
            <TextField label="Or pick a date" type="date" min={today} value={date} onChange={(e) => { if (e.target.value) { setDate(e.target.value); setPick(null) } }} className="w-48" />
          </div>
          <p className="font-semibold" aria-live="polite">{formatDate(date, true)}</p>
          <ScheduleGrid
            date={date}
            ctx={ctx}
            now={now}
            selected={pick}
            onSelect={(roomId, startMin) => { setPick({ roomId, startMin }); setMsg(null) }}
            caption={`Rooms you can move to on ${formatDate(date, true)}`}
          />
          {pick && startAt && endAt && (
            <div aria-live="polite">
              {unchanged ? (
                <Callout tone="info" title="That's the current time and room. Pick a different one." />
              ) : issues.length ? (
                <Callout tone="error" title={`${roomName(pick.roomId)}, ${formatRange(startAt, endAt)} doesn't work`}>{issues.map((i) => i.message).join(' ')}</Callout>
              ) : (
                <p className="text-sm">New time: <strong>{roomName(pick.roomId)}, {formatDate(startAt)}, {formatRange(startAt, endAt)}</strong>. Same price.</p>
              )}
            </div>
          )}
          <div className="flex flex-wrap gap-3">
            <button type="button" className={isStaff ? 'inline-flex min-h-9 items-center border border-rust bg-rust px-3 text-sm font-semibold text-paper hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-50' : 'btn btn-primary'} disabled={!pick || unchanged || issues.length > 0} onClick={move}>
              Move booking
            </button>
            <button type="button" className={isStaff ? 'inline-flex min-h-9 items-center border border-slate px-3 text-sm hover:border-paper' : 'btn btn-ghost'} onClick={() => { setOpen(false); setPick(null) }}>
              Keep current time
            </button>
          </div>
        </div>
      )}
      {msg && <Callout className="mt-4" tone={msg.ok ? 'success' : 'error'} title={msg.text} />}
    </section>
  )
}
