import { useMemo } from 'react'
import { Link } from 'react-router'
import { availabilityContext, useDemoState } from '../../services/demoStore'
import { useNow } from '../../features/booking/useNow'
import { ScheduleGrid } from '../../features/booking/ScheduleGrid'
import { PortalHeader } from '../../components/ui/PortalHeader'
import { Stat } from '../../features/admin/adminUi'
import { Callout } from '../../components/ui/Callout'
import { formatPHP } from '../../utils/money'
import { CalendarPlus } from 'lucide-react'
import { dateKeyOf, formatDate, todayManila } from '../../utils/time'

export function AdminOverview() {
  const s = useDemoState()
  const now = useNow()
  const ctx = useMemo(() => availabilityContext(s), [s])
  const today = todayManila(now)
  const awaiting = s.bookings.filter((b) => b.status === 'awaiting_verification')
  const todays = s.bookings.filter((b) => dateKeyOf(b.startAt) === today && ['confirmed', 'awaiting_verification', 'completed'].includes(b.status))
  const lessonReqs = s.lessons.filter((l) => l.status === 'requested')
  const refundsDue = s.bookings.filter((b) => b.payment.refund?.status === 'due')
  const inquiries = s.streaming.filter((x) => x.status === 'pending').length + s.shopInquiries.filter((x) => x.status === 'pending').length

  return (
    <>
      <PortalHeader
        title="Admin overview"
        eyebrow={`Today · ${formatDate(today, true)}`}
        actions={<Link to="/admin/book" className="inline-flex min-h-10 items-center gap-2 border border-rust bg-rust px-4 text-sm font-semibold text-paper no-underline hover:brightness-110"><CalendarPlus aria-hidden="true" className="size-4" /> Book a room</Link>}
      />
      {refundsDue.length > 0 && (
        <Callout tone="warning" title={`${refundsDue.length} GCash refund${refundsDue.length > 1 ? 's' : ''} to send`} className="mb-4">
          {refundsDue.map((b) => (
            <span key={b.id} className="block">
              <Link className="underline" to={`/admin/bookings/${b.reference}`}>{b.reference}</Link> — return {formatPHP(b.payment.refund!.amount)} to {b.customer.name}
            </span>
          ))}
        </Callout>
      )}
      <div className="grid grid-cols-2 gap-2 sm:gap-3 xl:grid-cols-4">
        <Stat label="Payments to verify" value={awaiting.length} hint={<Link className="underline" to="/admin/bookings?status=awaiting_verification">Review</Link>} />
        <Stat label="Rehearsals today" value={todays.length} />
        <Stat label="Lesson requests" value={lessonReqs.length} hint={<Link className="underline" to="/admin/lessons">Open</Link>} />
        <Stat label="Open inquiries" value={inquiries} hint="Streaming + shop" />
      </div>
      <section aria-labelledby="today-title" className="mt-8">
        <h2 id="today-title" className="text-lg font-semibold">Today&apos;s room schedule</h2>
        <div className="mt-3 border border-slate p-3">
          <ScheduleGrid date={today} ctx={ctx} now={now} caption={`Room schedule for ${formatDate(today, true)}`} renderDetail={(c) => c.occupants.map((o) => o.reference).join(', ')} linkFor={(o) => (o.kind === 'rehearsal' ? `/admin/bookings/${o.reference}` : '/admin/lessons')} />
        </div>
        <p className="mt-2 text-xs text-muted">Only bookings that hold a room are shown (awaiting verification, confirmed; lesson requests and confirmed lessons). <Link className="underline" to="/admin/rooms">Other days</Link></p>
      </section>
    </>
  )
}
