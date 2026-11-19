import { useState } from 'react'
import { Link, useSearchParams } from 'react-router'
import { useDemoState } from '../../services/demoStore'
import { PortalHeader } from '../../components/ui/PortalHeader'
import { StatusLabel } from '../../components/ui/StatusLabel'
import { Table, Td, Th, adminInput } from '../../features/admin/adminUi'
import type { RehearsalStatus } from '../../types/domain'
import { roomName } from '../../data/rooms'
import { formatPHP } from '../../utils/money'
import { formatDate, formatRange, toMs } from '../../utils/time'

const STATUSES: ('all' | RehearsalStatus)[] = ['all', 'awaiting_verification', 'awaiting_payment', 'confirmed', 'completed', 'cancelled', 'rejected']

export function AdminBookings() {
  const s = useDemoState()
  const [params, setParams] = useSearchParams()
  const status = (params.get('status') as (typeof STATUSES)[number]) || 'all'
  const [q, setQ] = useState('')
  const rows = s.bookings
    .filter((b) => status === 'all' || b.status === status)
    .filter((b) => !q || `${b.reference} ${b.customer.name} ${b.customer.bandName ?? ''}`.toLowerCase().includes(q.toLowerCase()))
    .sort((a, b) => toMs(a.startAt) - toMs(b.startAt))

  return (
    <>
      <PortalHeader title="Bookings" eyebrow="Rehearsal reservations" />
      <div className="mb-4 flex flex-wrap items-end gap-3">
        <label className="text-sm">
          <span className="mb-1 block text-muted">Status</span>
          <select className={adminInput} value={status} onChange={(e) => setParams(e.target.value === 'all' ? {} : { status: e.target.value })}>
            {STATUSES.map((st) => <option key={st} value={st}>{st === 'all' ? 'All statuses' : st.replace(/_/g, ' ')}</option>)}
          </select>
        </label>
        <label className="text-sm">
          <span className="mb-1 block text-muted">Search</span>
          <input className={adminInput} type="search" placeholder="Reference, name or band" value={q} onChange={(e) => setQ(e.target.value)} />
        </label>
        <p className="text-sm text-muted" aria-live="polite">{rows.length} booking{rows.length === 1 ? '' : 's'}</p>
      </div>
      <Table caption="Rehearsal bookings">
        <thead>
          <tr><Th>Reference</Th><Th>Customer</Th><Th>Room</Th><Th>When</Th><Th className="text-right">Total</Th><Th>Downpayment</Th><Th>Status</Th></tr>
        </thead>
        <tbody>
          {rows.map((b) => (
            <tr key={b.id} className="hover:bg-surface/60">
              <Td><Link to={`/admin/bookings/${b.reference}`} className="font-mono font-bold underline">{b.reference}</Link></Td>
              <Td>{b.customer.name}{b.customerId === 'guest' && <span className="ml-1.5 border border-slate px-1 text-[0.65rem] text-muted">Guest</span>}<span className="block text-xs text-muted">{[b.customer.bandName, b.customer.phone].filter(Boolean).join(' · ')}</span></Td>
              <Td>{roomName(b.roomId)}</Td>
              <Td className="whitespace-nowrap">{formatDate(b.startAt)}<span className="block text-xs text-muted">{formatRange(b.startAt, b.endAt)}</span></Td>
              <Td className="text-right font-mono">{formatPHP(b.total)}</Td>
              <Td><span className="font-mono">{formatPHP(b.downpaymentRequired)}</span> <StatusLabel status={b.payment.status} variant="plain" className="ml-1" /></Td>
              <Td><StatusLabel status={b.status} variant="plain" /></Td>
            </tr>
          ))}
          {rows.length === 0 && <tr><Td colSpan={7} className="py-6 text-center text-muted">No bookings match.</Td></tr>}
        </tbody>
      </Table>
    </>
  )
}
