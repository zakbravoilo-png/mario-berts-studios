import { Link } from 'react-router'
import { ArrowRight, CalendarClock, Drum, Package, RadioTower, Ticket } from 'lucide-react'
import { useDemoState } from '../../services/demoStore'
import { useCurrentCustomer, ownsRecord } from '../../services/accounts'
import { useNow } from '../../features/booking/useNow'
import { ReservationTicket } from '../../features/booking/ReservationTicket'
import { PortalHeader } from '../../components/ui/PortalHeader'
import { EmptyState } from '../../components/ui/EmptyState'
import { Callout } from '../../components/ui/Callout'
import { toMs } from '../../utils/time'
import { formatPHP } from '../../utils/money'

export function PortalDashboard() {
  const s = useDemoState()
  const me = useCurrentCustomer()!
  const now = useNow()
  const mine = s.bookings.filter((b) => ownsRecord(me, b))
  const upcoming = mine
    .filter((b) => ['awaiting_payment', 'awaiting_verification', 'confirmed'].includes(b.status) && toMs(b.endAt) > now)
    .sort((a, b) => toMs(a.startAt) - toMs(b.startAt))
  const needPayment = upcoming.filter((b) => b.status === 'awaiting_payment')
  const myLessons = s.lessons.filter((l) => ownsRecord(me, l) && ['requested', 'confirmed'].includes(l.status) && toMs(l.endAt) > now)

  return (
    <>
      <PortalHeader title="Dashboard" eyebrow="Customer portal · demo" />
      <div className="card flex flex-wrap items-center justify-between gap-4 p-5">
        <div className="flex items-center gap-4">
          <span aria-hidden="true" className="grid size-14 place-items-center rounded-full border border-slate bg-ink font-display text-2xl">
            {me.name.slice(0, 1).toUpperCase()}
          </span>
          <div>
            <p className="text-xl font-semibold">Hi, {me.name}</p>
            <p className="text-sm text-muted">{me.bandName || 'No band name set'} · {me.phone} · demo account</p>
          </div>
        </div>
        <Link to="/portal/book/rehearsal" className="btn btn-primary">
          Book a room <ArrowRight aria-hidden="true" className="size-5" />
        </Link>
      </div>

      {needPayment.length > 0 && (
        <Callout tone="warning" title={`${needPayment.length} booking${needPayment.length > 1 ? 's' : ''} waiting for your downpayment`} className="mt-6">
          {needPayment.map((b) => (
            <p key={b.id}>
              <Link className="underline" to={`/portal/reservations/${b.reference}`}>{b.reference}</Link> — send {formatPHP(b.downpaymentRequired)} via GCash (demo). The room isn&apos;t held until you do.
            </p>
          ))}
        </Callout>
      )}

      <section aria-labelledby="next-title" className="mt-8">
        <div className="flex items-end justify-between gap-4">
          <h2 id="next-title" className="font-display text-2xl tracking-wide">Up next</h2>
          <Link to="/portal/reservations" className="link text-sm">All reservations</Link>
        </div>
        <div className="mt-4">
          {upcoming[0] ? (
            <Link to={`/portal/reservations/${upcoming[0].reference}`} className="block no-underline transition-transform hover:-translate-y-0.5" aria-label={`Open reservation ${upcoming[0].reference}`}>
              <ReservationTicket booking={upcoming[0]} />
            </Link>
          ) : (
            <EmptyState icon={Ticket} title="No upcoming rehearsals" action={<Link to="/portal/book/rehearsal" className="btn btn-primary">Book a room</Link>}>
              Your next booking will show up here as a ticket.
            </EmptyState>
          )}
        </div>
        {upcoming.length > 1 && <p className="mt-3 text-sm text-muted">+ {upcoming.length - 1} more upcoming</p>}
        {myLessons.length > 0 && <p className="mt-2 text-sm text-muted">{myLessons.length} upcoming lesson request{myLessons.length > 1 ? 's' : ''} — see Reservations.</p>}
      </section>

      <section aria-labelledby="more-title" className="mt-12">
        <h2 id="more-title" className="font-display text-2xl tracking-wide">More ways to play</h2>
        <ul className="mt-4 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          {[
            { to: '/portal/book/rehearsal', icon: CalendarClock, title: 'Rehearsal room', body: '₱250/hour, gear included.' },
            { to: '/portal/book/lesson', icon: Drum, title: 'One-on-one lesson', body: 'Beginner or intermediate, any of six instruments.' },
            { to: '/portal/live-streaming', icon: RadioTower, title: 'Stream a gig', body: '₱500/hour. Send an inquiry.' },
            { to: '/portal/orders', icon: Package, title: 'Strings & sticks', body: 'Ask about strings or drumsticks.' },
          ].map((c) => (
            <li key={c.to}>
              <Link to={c.to} className="card flex h-full flex-col p-5 no-underline hover:border-paper">
                <c.icon aria-hidden="true" className="size-6 text-rust-light" />
                <span className="mt-3 font-semibold">{c.title}</span>
                <span className="mt-1 text-sm text-muted">{c.body}</span>
              </Link>
            </li>
          ))}
        </ul>
      </section>
    </>
  )
}
