import { useMemo, useState } from 'react'
import { Link } from 'react-router'
import { availabilityContext, useDemoState } from '../../services/demoStore'
import { useNow } from '../../features/booking/useNow'
import { ScheduleGrid } from '../../features/booking/ScheduleGrid'
import { lessonHolds, rehearsalHolds } from '../../features/booking/availability'
import { PortalHeader } from '../../components/ui/PortalHeader'
import { StatusLabel } from '../../components/ui/StatusLabel'
import { Table, Td, Th, adminInput } from '../../features/admin/adminUi'
import { rooms } from '../../data/rooms'
import { lessonLabel } from '../../data/services'
import { addDays, dateKeyOf, formatDate, formatRange, toMs, todayManila } from '../../utils/time'

export function AdminRooms() {
  const s = useDemoState()
  const now = useNow()
  const ctx = useMemo(() => availabilityContext(s), [s])
  const [date, setDate] = useState(() => todayManila())
  const entries = [
    ...s.bookings.filter((b) => dateKeyOf(b.startAt) === date).map((b) => ({ id: b.id, kind: 'Rehearsal', ref: b.reference, who: b.customer.bandName || b.customer.name, roomId: b.roomId, startAt: b.startAt, endAt: b.endAt, status: b.status, holds: rehearsalHolds(b, s.settings), href: `/admin/bookings/${b.reference}` })),
    ...s.lessons.filter((l) => dateKeyOf(l.startAt) === date).map((l) => ({ id: l.id, kind: `${lessonLabel(l.lessonType)} lesson`, ref: l.reference, who: l.customer.name, roomId: l.roomId, startAt: l.startAt, endAt: l.endAt, status: l.status, holds: lessonHolds(l, s.settings), href: '/admin/lessons' })),
  ].sort((a, b) => toMs(a.startAt) - toMs(b.startAt))

  return (
    <>
      <PortalHeader title="Rooms & schedule" description="Three rooms, each bookable on its own. Rehearsals and lessons share the same room schedule." />
      <div className="mb-4 flex flex-wrap items-end gap-2">
        <button type="button" className={adminInput} onClick={() => setDate(addDays(date, -1))}>← Previous day</button>
        <label className="text-sm">
          <span className="sr-only">Date</span>
          <input type="date" className={adminInput} value={date} onChange={(e) => e.target.value && setDate(e.target.value)} />
        </label>
        <button type="button" className={adminInput} onClick={() => setDate(addDays(date, 1))}>Next day →</button>
        <button type="button" className={adminInput} onClick={() => setDate(todayManila())}>Today</button>
      </div>
      <p className="mb-2 font-semibold">{formatDate(date, true)}</p>
      <div className="border border-slate p-3">
        <ScheduleGrid date={date} ctx={ctx} now={now} caption={`Room schedule for ${formatDate(date, true)}`} renderDetail={(c) => c.occupants.map((o) => o.reference).join(', ')} linkFor={(o) => (o.kind === 'rehearsal' ? `/admin/bookings/${o.reference}` : '/admin/lessons')} />
      </div>
      <h2 className="mt-8 text-lg font-semibold">Everything on this day</h2>
      <div className="mt-3">
        <Table caption={`Bookings and lessons on ${formatDate(date)}`}>
          <thead><tr><Th>Time</Th><Th>Room</Th><Th>Type</Th><Th>Reference</Th><Th>Who</Th><Th>Status</Th><Th>Holds room?</Th></tr></thead>
          <tbody>
            {entries.map((e) => (
              <tr key={e.id}>
                <Td className="whitespace-nowrap">{formatRange(e.startAt, e.endAt)}</Td>
                <Td>{rooms.find((r) => r.id === e.roomId)?.name}</Td>
                <Td>{e.kind}</Td>
                <Td><Link to={e.href} className="font-mono underline">{e.ref}</Link></Td>
                <Td>{e.who}</Td>
                <Td><StatusLabel status={e.status} variant="plain" /></Td>
                <Td>{e.holds ? 'Yes' : 'No'}</Td>
              </tr>
            ))}
            {entries.length === 0 && <tr><Td colSpan={7} className="py-6 text-center text-muted">Nothing booked on this day.</Td></tr>}
          </tbody>
        </Table>
      </div>
      <p className="mt-3 text-xs text-muted">Room descriptions are placeholders to be provided by the studio. No gap is needed between bookings (confirmed).</p>
    </>
  )
}
