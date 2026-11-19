import { useState } from 'react'
import { Plus, Trash2 } from 'lucide-react'
import { useDemoState } from '../../services/demoStore'
import { adminUpdateInstructor } from '../../services/actions'
import { PortalHeader } from '../../components/ui/PortalHeader'
import { Callout } from '../../components/ui/Callout'
import { StatusLabel } from '../../components/ui/StatusLabel'
import { AdminButton, adminInput } from '../../features/admin/adminUi'
import { dayNames } from '../../data/instructors'
import { lessonLabel, lessonLevels, lessonTypes } from '../../data/services'
import type { Instructor } from '../../types/domain'
import { formatDate, formatRange, hhmmToMinutes, toMs } from '../../utils/time'

export function AdminInstructors() {
  const s = useDemoState()
  const [selectedId, setSelectedId] = useState(s.instructors[0]?.id ?? '')
  const current = s.instructors.find((i) => i.id === selectedId)
  return (
    <>
      <PortalHeader title="Instructors" description="Demo instructors — placeholders until the studio provides real names, what each teaches and schedules." />
      <div className="grid gap-6 lg:grid-cols-[16rem_1fr]">
        <ul className="space-y-1" aria-label="Instructors">
          {s.instructors.map((i) => (
            <li key={i.id}>
              <button type="button" aria-pressed={i.id === selectedId} onClick={() => setSelectedId(i.id)} className={`w-full border px-3 py-2 text-left text-sm ${i.id === selectedId ? 'border-paper bg-surface font-semibold' : 'border-slate hover:border-paper'}`}>
                {i.displayName} <span className="demo-chip ml-1">Demo</span>
                <span className="block text-xs text-muted">{i.instruments.map(lessonLabel).join(', ')}{i.active ? '' : ' · inactive'}</span>
              </button>
            </li>
          ))}
        </ul>
        {current && <InstructorEditor key={current.id} inst={current} />}
      </div>
    </>
  )
}

function InstructorEditor({ inst }: { inst: Instructor }) {
  const s = useDemoState()
  const [draft, setDraft] = useState<Instructor>(inst)
  const [msg, setMsg] = useState<{ ok: boolean; text: string } | null>(null)
  const lessons = s.lessons.filter((l) => l.instructorId === inst.id).sort((a, b) => toMs(a.startAt) - toMs(b.startAt))
  const toggle = <T,>(list: T[], v: T) => (list.includes(v) ? list.filter((x) => x !== v) : [...list, v])

  function save() {
    if (!draft.displayName.trim()) return setMsg({ ok: false, text: 'Name is required.' })
    if (!draft.instruments.length || !draft.levels.length) return setMsg({ ok: false, text: 'Pick at least one instrument and one level.' })
    if (draft.weeklyAvailability.some((w) => hhmmToMinutes(w.end) <= hhmmToMinutes(w.start))) return setMsg({ ok: false, text: 'Each schedule window must end after it starts.' })
    adminUpdateInstructor({ ...draft, displayName: draft.displayName.trim() })
    setMsg({ ok: true, text: 'Saved (demo). Existing lessons are not changed automatically.' })
  }

  return (
    <div className="space-y-6">
      <section className="border border-slate p-4" aria-labelledby="edit-title">
        <h2 id="edit-title" className="font-semibold">Edit {inst.displayName}</h2>
        <div className="mt-3 grid gap-4 sm:grid-cols-2">
          <label className="text-sm"><span className="mb-1 block text-muted">Display name</span><input className={`${adminInput} w-full`} value={draft.displayName} onChange={(e) => setDraft({ ...draft, displayName: e.target.value })} /></label>
          <label className="flex items-center gap-2 self-end text-sm"><input type="checkbox" checked={draft.active} onChange={(e) => setDraft({ ...draft, active: e.target.checked })} className="size-4 accent-[var(--color-rust)]" /> Active</label>
          <fieldset className="text-sm"><legend className="mb-1 text-muted">Instruments</legend>
            <div className="flex flex-wrap gap-3">{lessonTypes.map((t) => (
              <label key={t.id} className="flex items-center gap-1.5"><input type="checkbox" className="size-4 accent-[var(--color-rust)]" checked={draft.instruments.includes(t.id)} onChange={() => setDraft({ ...draft, instruments: toggle(draft.instruments, t.id) })} />{t.label}</label>
            ))}</div>
          </fieldset>
          <fieldset className="text-sm"><legend className="mb-1 text-muted">Levels</legend>
            <div className="flex flex-wrap gap-3">{lessonLevels.map((l) => (
              <label key={l.id} className="flex items-center gap-1.5"><input type="checkbox" className="size-4 accent-[var(--color-rust)]" checked={draft.levels.includes(l.id)} onChange={() => setDraft({ ...draft, levels: toggle(draft.levels, l.id) })} />{l.label}</label>
            ))}</div>
          </fieldset>
        </div>
        <fieldset className="mt-5 text-sm">
          <legend className="mb-2 text-muted">Weekly schedule (Asia/Manila)</legend>
          <ul className="space-y-2">
            {draft.weeklyAvailability.map((w, idx) => (
              <li key={idx} className="flex flex-wrap items-center gap-2">
                <select aria-label={`Day for window ${idx + 1}`} className={adminInput} value={w.day} onChange={(e) => setDraft({ ...draft, weeklyAvailability: draft.weeklyAvailability.map((x, j) => (j === idx ? { ...x, day: Number(e.target.value) } : x)) })}>
                  {dayNames.map((n, d) => <option key={n} value={d}>{n}</option>)}
                </select>
                <input aria-label={`Start for window ${idx + 1}`} type="time" step={1800} className={adminInput} value={w.start} onChange={(e) => setDraft({ ...draft, weeklyAvailability: draft.weeklyAvailability.map((x, j) => (j === idx ? { ...x, start: e.target.value } : x)) })} />
                <span aria-hidden="true">–</span>
                <input aria-label={`End for window ${idx + 1}`} type="time" step={1800} className={adminInput} value={w.end} onChange={(e) => setDraft({ ...draft, weeklyAvailability: draft.weeklyAvailability.map((x, j) => (j === idx ? { ...x, end: e.target.value } : x)) })} />
                <AdminButton aria-label={`Remove window ${idx + 1}`} onClick={() => setDraft({ ...draft, weeklyAvailability: draft.weeklyAvailability.filter((_, j) => j !== idx) })}><Trash2 aria-hidden="true" className="size-4" /></AdminButton>
              </li>
            ))}
          </ul>
          <AdminButton className="mt-2" onClick={() => setDraft({ ...draft, weeklyAvailability: [...draft.weeklyAvailability, { day: 1, start: '09:00', end: '17:00' }] })}><Plus aria-hidden="true" className="size-4" /> Add window</AdminButton>
        </fieldset>
        <div className="mt-5 flex items-center gap-3">
          <AdminButton tone="primary" onClick={save}>Save instructor</AdminButton>
        </div>
        {msg && <Callout tone={msg.ok ? 'success' : 'error'} title={msg.text} className="mt-3" />}
      </section>
      <section aria-labelledby="il-title">
        <h2 id="il-title" className="font-semibold">Lessons with {inst.displayName}</h2>
        <ul className="mt-2 space-y-1 text-sm">
          {lessons.length === 0 ? <li className="text-muted">None.</li> : lessons.map((l) => (
            <li key={l.id} className="flex flex-wrap items-center gap-2">
              <span className="font-mono">{l.reference}</span> {formatDate(l.startAt)} {formatRange(l.startAt, l.endAt)} · {lessonLabel(l.lessonType)} <StatusLabel status={l.status} variant="plain" />
            </li>
          ))}
        </ul>
      </section>
    </div>
  )
}
