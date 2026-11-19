import { useDemoState } from '../../services/demoStore'
import { setStreamingStatus } from '../../services/actions'
import { PortalHeader } from '../../components/ui/PortalHeader'
import { StatusLabel } from '../../components/ui/StatusLabel'
import { Table, Td, Th, adminInput } from '../../features/admin/adminUi'
import type { InquiryStatus } from '../../types/domain'
import { formatPHP } from '../../utils/money'
import { formatDate } from '../../utils/time'

const STATUSES: InquiryStatus[] = ['pending', 'responded', 'closed']

export function AdminStreaming() {
  const s = useDemoState()
  return (
    <>
      <PortalHeader title="Streaming inquiries" description="₱500/hour estimate. Packages and scope are to be confirmed by the studio — these are inquiries, not bookings." />
      <Table caption="Live gig streaming inquiries">
        <thead><tr><Th>Reference</Th><Th>Contact</Th><Th>Event</Th><Th>Hours</Th><Th className="text-right">Estimate</Th><Th>Status</Th></tr></thead>
        <tbody>
          {s.streaming.map((x) => (
            <tr key={x.id}>
              <Td className="font-mono font-bold">{x.reference}</Td>
              <Td>{x.customer.name}<span className="block text-xs text-muted">{[x.customer.email, x.customer.phone].filter(Boolean).join(' · ')}</span></Td>
              <Td>{formatDate(x.eventDate)} · {x.eventLocation}<span className="block text-xs text-muted">{x.description}</span></Td>
              <Td>{x.estimatedHours}</Td>
              <Td className="text-right font-mono">{formatPHP(x.estimatedPrice)}</Td>
              <Td>
                <div className="flex flex-wrap items-center gap-2">
                  <StatusLabel status={x.status} variant="plain" />
                  <select aria-label={`Status for ${x.reference}`} className={adminInput} value={x.status} onChange={(e) => setStreamingStatus(x.id, e.target.value as InquiryStatus)}>
                    {STATUSES.map((st) => <option key={st} value={st}>{st}</option>)}
                  </select>
                </div>
              </Td>
            </tr>
          ))}
          {s.streaming.length === 0 && <tr><Td colSpan={6} className="py-6 text-center text-muted">No inquiries.</Td></tr>}
        </tbody>
      </Table>
    </>
  )
}
