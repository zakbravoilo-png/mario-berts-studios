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
import { formatPHP, formatPHPOrTbd } from '../../utils/money'
import { INSTRUCTOR_SHARE, instructorPayouts, lessonSplit } from '../../features/lessons/split'
import { formatDate, formatRange, toMs } from '../../utils/time'

export function AdminLessons() {
  const s = useDemoState()
  const ctx = useMemo(() => availabilityContext(s), [s])
  const [msg, setMsg] = useState<{ ok: boolean; text: string } | null>(null)
  const [now] = useState(() => Date.now())
  const payouts = instructorPayouts(s.lessons)
  const instPct = Math.round(INSTRUCTOR_SHARE * 100)
  const instName = (id: string) => s.instructors.find((i) => i.id === id)?.displayName ?? id
  const lessons = [...s.lessons].sort((a, b) => toMs(a.startAt) - toMs(b.startAt))
  const run = (r: { ok: true } | { ok: false; errors: string[] }, ok: string) => setMsg(r.ok ? { ok: true, text: ok } : { ok: false, text: r.errors.join(' ') })

  return (
    <>
      <PortalHeader title="Lesson requests" description={`Lessons block a studio room. Students pay the full fee on the day, at the studio. Each fee is split ${instPct}% to the instructor and ${100 - instPct}% to the studio.`} />
      {msg && <Callout tone={msg.ok ? 'success' : 'error'} title={msg.text} className="mb-4" />}
      <Table caption="Lesson requests" minWidth="64rem">
        <thead><tr><Th>Reference</Th><Th>Student</Th><Th>Lesson</Th><Th>When</Th><Th>Instructor</Th><Th>Room</Th><Th>Price</Th><Th>Split</Th><Th>Status</Th><Th>Actions</Th></tr></thead>
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
                <Td className="text-xs whitespace-nowrap">
                  {l.sessionPrice === null ? '—' : (() => {
                    const sp = lessonSplit(l.sessionPrice)
                    return (<><span className="block">Instructor <span className="font-mono">{formatPHP(sp.instructor)}</span></span><span className="block text-muted">Studio <span className="font-mono">{formatPHP(sp.studio)}</span></span></>)
                  })()}
                </Td>
                <Td><StatusLabel status={l.status} variant="plain" /></Td>
                <Td>
                  <div className="flex flex-wrap gap-1.5">
                    {l.status === 'requested' && <AdminButton tone="primary" onClick={() => run(adminUpdateLesson(l.id, { status: 'confirmed' }), `${l.reference} confirmed.`)}>Confirm</AdminButton>}
                    {l.status === 'confirmed' && toMs(l.startAt) <= now && <AdminButton tone="primary" onClick={() => run(adminUpdateLesson(l.id, { status: 'completed' }), `${l.reference} marked as taught and paid in full.`)}>Paid in full</AdminButton>}
                    {live && <AdminButton onClick={() => run(adminUpdateLesson(l.id, { status: 'declined' }), `${l.reference} declined (demo).`)}>Decline</AdminButton>}
                  </div>
                </Td>
              </tr>
            )
          })}
        </tbody>
      </Table>
      <p className="mt-3 text-xs text-muted">After a lesson, collect the full fee and press <strong>Paid in full</strong>; it then counts towards the instructor&apos;s payout. Declining is a demo action; the studio&apos;s policy is to be confirmed.</p>

      <section aria-labelledby="payouts-title" className="mt-10">
        <h2 id="payouts-title" className="font-semibold">Instructor payouts</h2>
        <p className="mt-1 text-sm text-muted">Lessons marked paid in full. {instPct}% goes to the instructor, {100 - instPct}% to the studio. Demo totals for all time; settle up with each instructor by hand.</p>
        {payouts.length === 0 ? (
          <p className="mt-3 text-sm">No paid lessons yet.</p>
        ) : (
          <div className="mt-3"><Table caption="Instructor payouts" minWidth="36rem">
            <thead><tr><Th>Instructor</Th><Th>Lessons</Th><Th>Fees collected</Th><Th>Instructor ({instPct}%)</Th><Th>Studio ({100 - instPct}%)</Th></tr></thead>
            <tbody>
              {payouts.map((p) => (
                <tr key={p.instructorId}>
                  <Td>{instName(p.instructorId)}</Td>
                  <Td className="font-mono">{p.lessons}</Td>
                  <Td className="font-mono">{formatPHP(p.price)}</Td>
                  <Td className="font-mono font-bold">{formatPHP(p.instructor)}</Td>
                  <Td className="font-mono">{formatPHP(p.studio)}</Td>
                </tr>
              ))}
            </tbody>
          </Table></div>
        )}
      </section>
    </>
  )
}
