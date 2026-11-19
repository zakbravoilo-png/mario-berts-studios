import { useState } from 'react'
import { Link } from 'react-router'
import { GraduationCap, Ticket } from 'lucide-react'
import { useDemoState } from '../../services/demoStore'
import { useCurrentCustomer, ownsRecord } from '../../services/accounts'
import { useNow } from '../../features/booking/useNow'
import { LessonTicket, ReservationTicket } from '../../features/booking/ReservationTicket'
import { PortalHeader } from '../../components/ui/PortalHeader'
import { EmptyState } from '../../components/ui/EmptyState'
import type { RehearsalBooking } from '../../types/domain'
import { toMs } from '../../utils/time'

const FILTERS = [
  { id: 'upcoming', label: 'Upcoming' },
  { id: 'action', label: 'Needs payment' },
  { id: 'past', label: 'Completed' },
  { id: 'closed', label: 'Cancelled / rejected' },
  { id: 'all', label: 'All' },
] as const
type Filter = (typeof FILTERS)[number]['id']

function matches(b: RehearsalBooking, f: Filter, now: number) {
  const live = ['awaiting_payment', 'awaiting_verification', 'confirmed'].includes(b.status)
  switch (f) {
    case 'upcoming':
      return live && toMs(b.endAt) > now
    case 'action':
      return b.status === 'awaiting_payment'
    case 'past':
      return b.status === 'completed'
    case 'closed':
      return b.status === 'cancelled' || b.status === 'rejected'
    default:
      return true
  }
}

export function ReservationsPage() {
  const s = useDemoState()
  const me = useCurrentCustomer()!
  const now = useNow()
  const [filter, setFilter] = useState<Filter>('upcoming')
  const mine = s.bookings
    .filter((b) => ownsRecord(me, b) && matches(b, filter, now))
    .sort((a, b) => (filter === 'past' || filter === 'closed' ? toMs(b.startAt) - toMs(a.startAt) : toMs(a.startAt) - toMs(b.startAt)))
  const lessons = s.lessons.filter((l) => ownsRecord(me, l)).sort((a, b) => toMs(a.startAt) - toMs(b.startAt))
  const instName = (id: string) => s.instructors.find((i) => i.id === id)?.displayName ?? 'Instructor'

  return (
    <>
      <PortalHeader
        title="My reservations"
        eyebrow="Customer portal · demo"
        actions={<Link to="/portal/book/rehearsal" className="btn btn-primary">Book a room</Link>}
      />
      <div role="group" aria-label="Filter reservations" className="flex flex-wrap gap-2">
        {FILTERS.map((f) => (
          <button
            key={f.id}
            type="button"
            aria-pressed={filter === f.id}
            onClick={() => setFilter(f.id)}
            className={`min-h-10 border px-3 text-sm ${filter === f.id ? 'border-paper bg-paper font-semibold text-ink' : 'border-slate hover:border-paper'}`}
          >
            {f.label}
          </button>
        ))}
      </div>

      <section aria-label="Rehearsal reservations" className="mt-6 space-y-5">
        {mine.length === 0 ? (
          <EmptyState icon={Ticket} title="Nothing here" action={<Link to="/portal/book/rehearsal" className="btn btn-primary">Book a room</Link>}>
            No rehearsal reservations match this filter.
          </EmptyState>
        ) : (
          mine.map((b) => (
            <Link key={b.id} to={`/portal/reservations/${b.reference}`} className="block no-underline transition-transform hover:-translate-y-0.5" aria-label={`Open reservation ${b.reference}`}>
              <ReservationTicket booking={b} />
            </Link>
          ))
        )}
      </section>

      <section aria-labelledby="lessons-title" className="mt-12">
        <div className="flex items-end justify-between gap-4">
          <h2 id="lessons-title" className="font-display text-2xl tracking-wide">Lesson requests</h2>
          <Link to="/portal/book/lesson" className="link text-sm">Request a lesson</Link>
        </div>
        <div className="mt-4 space-y-5">
          {lessons.length === 0 ? (
            <EmptyState icon={GraduationCap} title="No lesson requests yet" />
          ) : (
            lessons.map((l) => (
              <Link key={l.id} to={`/portal/reservations/${l.reference}`} className="block no-underline transition-transform hover:-translate-y-0.5" aria-label={`Open lesson ${l.reference}`}>
                <LessonTicket lesson={l} instructorName={instName(l.instructorId)} />
              </Link>
            ))
          )}
        </div>
      </section>
    </>
  )
}
