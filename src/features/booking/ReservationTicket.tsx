import type { LessonRequest, RehearsalBooking } from '../../types/domain'
import { TicketStub } from '../../components/grunge'
import { StatusLabel } from '../../components/ui/StatusLabel'
import { roomName } from '../../data/rooms'
import { lessonLabel, levelLabel } from '../../data/services'
import { formatPHP } from '../../utils/money'
import { formatDate, formatRange } from '../../utils/time'

/** A rehearsal reservation as a gig ticket stub. */
export function ReservationTicket({ booking: b, className = '' }: { booking: RehearsalBooking; className?: string }) {
  const paid =
    b.payment.status === 'verified'
      ? `${formatPHP(b.downpaymentRequired)} verified`
      : b.payment.status === 'submitted'
        ? `${formatPHP(b.downpaymentRequired)} sent, unverified`
        : `${formatPHP(b.downpaymentRequired)} due`
  return (
    <TicketStub
      className={className}
      reference={b.reference}
      title={`${roomName(b.roomId)} · ${b.durationHours} hr${b.durationHours === 1 ? '' : 's'}`}
      status={<StatusLabel status={b.status} />}
      amount={{ label: 'Total', value: formatPHP(b.total) }}
      fields={[
        { label: 'Date', value: formatDate(b.startAt) },
        { label: 'Time', value: formatRange(b.startAt, b.endAt) },
        { label: 'Band', value: b.customer.bandName || b.customer.name },
        { label: 'Balance', value: `${formatPHP(b.balance)} · after rehearsal` },
        { label: 'Downpayment', value: paid },
        { label: 'Extra gear', value: b.selectedEquipment.length ? `${b.selectedEquipment.reduce((n, e) => n + e.quantity, 0)} item(s)` : 'None' },
      ]}
      footnote="Demo reservation — not a real booking."
    />
  )
}

/** A lesson request as a ticket stub. */
export function LessonTicket({ lesson: l, instructorName, className = '' }: { lesson: LessonRequest; instructorName: string; className?: string }) {
  return (
    <TicketStub
      className={className}
      reference={l.reference}
      title={`${lessonLabel(l.lessonType)} lesson · ${levelLabel(l.level)}`}
      status={<StatusLabel status={l.status} />}
      amount={{ label: 'Price', value: l.sessionPrice === null ? 'TBD' : formatPHP(l.sessionPrice) }}
      fields={[
        { label: 'Date', value: formatDate(l.startAt) },
        { label: 'Time', value: formatRange(l.startAt, l.endAt) },
        { label: 'Room', value: roomName(l.roomId) },
        { label: 'Instructor', value: `${instructorName} (demo)` },
        { label: 'Payment', value: 'In full, on the day' },
        { label: 'Length', value: `${l.durationMinutes} min` },
      ]}
      footnote="Demo lesson request — awaiting studio response until confirmed."
    />
  )
}
