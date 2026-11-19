import { useState } from 'react'
import { useDemoState } from '../../services/demoStore'
import { PortalHeader } from '../../components/ui/PortalHeader'
import { Callout } from '../../components/ui/Callout'
import { Table, Td, Th, adminInput } from '../../features/admin/adminUi'
import { formatDate, formatTime } from '../../utils/time'

/** Demo outbox: every SMS/email confirmation the system would send. */
export function AdminMessages() {
  const s = useDemoState()
  const [channel, setChannel] = useState<'all' | 'sms' | 'email'>('all')
  const rows = [...s.notifications].reverse().filter((n) => channel === 'all' || n.channel === channel)
  return (
    <>
      <PortalHeader title="Messages (demo outbox)" description="Booking confirmations by SMS and email. Simulated — no SMS or email service is connected, so nothing is sent." />
      <Callout tone="demo" title="Not sent">
        To send for real, the studio needs an SMS provider and an email provider, called from a server (not this static site). See the README.
      </Callout>
      <label className="mt-4 inline-block text-sm">
        <span className="mb-1 block text-muted">Channel</span>
        <select className={adminInput} value={channel} onChange={(e) => setChannel(e.target.value as typeof channel)}>
          <option value="all">All</option>
          <option value="sms">SMS</option>
          <option value="email">Email</option>
        </select>
      </label>
      <div className="mt-4">
        <Table caption="Simulated outgoing messages" minWidth="56rem">
          <thead><tr><Th>When</Th><Th>Channel</Th><Th>To</Th><Th>Reference</Th><Th>Event</Th><Th>Message</Th></tr></thead>
          <tbody>
            {rows.map((n) => (
              <tr key={n.id}>
                <Td className="whitespace-nowrap">{formatDate(n.createdAt)}<span className="block text-xs text-muted">{formatTime(n.createdAt)}</span></Td>
                <Td>{n.channel === 'sms' ? 'SMS' : 'Email'}</Td>
                <Td className="break-all">{n.to}</Td>
                <Td className="font-mono">{n.reference}</Td>
                <Td>{n.event.replace(/_/g, ' ')}</Td>
                <Td>
                  <details>
                    <summary className="cursor-pointer">{n.subject ?? `${n.body.slice(0, 60)}…`}</summary>
                    <p className="mt-2 whitespace-pre-line text-xs">{n.body}</p>
                  </details>
                </Td>
              </tr>
            ))}
            {rows.length === 0 && <tr><Td colSpan={6} className="py-6 text-center text-muted">No messages yet. Make a booking to see one.</Td></tr>}
          </tbody>
        </Table>
      </div>
    </>
  )
}
