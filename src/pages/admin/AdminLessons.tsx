import { useMemo, useState } from 'react'
import { availabilityContext, useDemoState } from '../../services/demoStore'
import { adminUpdateLesson } from '../../services/actions'
import { availableInstructors, isRoomFree } from '../../features/booking/availability'
import { PortalHeader } from '../../components/ui/PortalHeader'
import { StatusLabel } from '../../components/ui/StatusLabel'
import { Callout } from '../../components/ui/Callout'
import { AdminButton, Table, Td, Th, adminInput } from '../../features/admin/adminUi'
import { lessonLabel, levelLabel } from '../../data/services'
import { rooms } from '../../data/rooms'
import { formatPHPOrTbd } from '../../utils/money'
import { formatDate, formatRange, toMs } from '../../utils/time'

export function AdminLessons() {
  const s = useDemoState()
  const ctx = useMemo(() => availabilityContext(s), [s])
  const [msg, setMsg] = useState<{ ok: boolean; text: string } | null>(null)
  const lessons = [...s.lessons].sort((a, b) => toMs(a.startAt) - toMs(b.startAt))
  const run = (r: { ok: true } | { ok: false; errors: string[] }, ok: string) => setMsg(r.ok ? { ok: true, text: ok } : { ok: false, text: r.errors.join(' ') })

  return (
    <>
      <PortalHeader title="Lesson requests" description="Lessons block a studio room. Reassigning a room or instructor is re-checked against the schedule." />
      {msg && <Callout tone={msg.ok ? 'success' : 'error'} title={msg.text} className="mb-4" />}
      <Table caption="Lesson requests" minWidth="64rem">
        <thead><tr><Th>Reference</Th><Th>Student</Th><Th>Lesson</Th><Th>When</Th><Th>Instructor</Th><Th>Room</Th><Th>Price</Th><Th>Status</Th><Th>Actions</Th></tr></thead>
        <tbody>
          {lessons.map((l) => {
            const live = l.status === 'requested' || l.status === 'confirmed'
            const insts = live ? availableInstructors(l.lessonType, l.level, l, ctx, l.id) : []
            return (
              <tr key={l.id}>
                <Td className="font-mono font-bold">{l.reference}</Td>
                <Td>{l.customer.name}{l.customer.notes && <span className="block text-xs text-muted">{l.customer.notes}</span>}</Td>
                <Td>{lessonLabel(l.lessonType)}<span className="block text-xs text-muted">{levelLabel(l.level)} · {l.durationMinutes} min</span></Td>
                <Td className="whitespace-nowrap">{formatDate(l.startAt)}<span className="block text-xs text-muted">{formatRange(l.startAt, l.endAt)}</span></Td>
                <Td>
                  {live ? (
                    <select aria-label={`Instructor for ${l.reference}`} className={adminInput} value={l.instructorId} onChange={(e) => run(adminUpdateLesson(l.id, { instructorId: e.target.value }), 'Instructor reassigned.')}>
                      {s.instructors.map((i) => {
                        const ok = i.id === l.instructorId || insts.some((x) => x.id === i.id)
                        return <option key={i.id} value={i.id} disabled={!ok}>{i.displayName}{ok ? '' : ' (unavailable)'}</option>
                      })}
                    </select>
                  ) : s.instructors.find((i) => i.id === l.instructorId)?.displayName}
                </Td>
                <Td>
                  {live ? (
                    <select aria-label={`Room for ${l.reference}`} className={adminInput} value={l.roomId} onChange={(e) => run(adminUpdateLesson(l.id, { roomId: e.target.value }), 'Room reassigned.')}>
                      {rooms.map((r) => {
                        const ok = r.id === l.roomId || isRoomFree(r.id, l, ctx, l.id)
                        return <option key={r.id} value={r.id} disabled={!ok}>{r.name}{ok ? '' : ' (busy)'}</option>
                      })}
                    </select>
                  ) : rooms.find((r) => r.id === l.roomId)?.name}
                </Td>
                <Td className="font-mono">{formatPHPOrTbd(l.sessionPrice)}</Td>
                <Td><StatusLabel status={l.status} variant="plain" /></Td>
                <Td>
                  <div className="flex flex-wrap gap-1.5">
                    {l.status === 'requested' && <AdminButton tone="primary" onClick={() => run(adminUpdateLesson(l.id, { status: 'confirmed' }), `${l.reference} confirmed.`)}>Confirm</AdminButton>}
                    {live && <AdminButton onClick={() => run(adminUpdateLesson(l.id, { status: 'declined' }), `${l.reference} declined (demo).`)}>Decline</AdminButton>}
                  </div>
                </Td>
              </tr>
            )
          })}
        </tbody>
      </Table>
      <p className="mt-3 text-xs text-muted">Declining is a demo action; the studio&apos;s policy is to be confirmed. Lesson payment terms are also to be confirmed.</p>
    </>
  )
}
