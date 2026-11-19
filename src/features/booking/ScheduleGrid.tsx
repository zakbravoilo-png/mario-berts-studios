import { Check, Circle, GraduationCap, Lock, Minus } from 'lucide-react'
import { Link } from 'react-router'
import type { AvailabilityContext, Occupant } from './availability'
import { cellFor, daySlots, type Cell, type CellState } from './scheduleCells'
import { formatMinutes, type DateKey } from '../../utils/time'

const STATE_UI: Record<CellState, { label: string; icon: typeof Circle; cls: string }> = {
  free: { label: 'Free', icon: Circle, cls: 'border-slate bg-ink text-paper hover:border-paper' },
  booked: { label: 'Booked', icon: Lock, cls: 'border-slate bg-[repeating-linear-gradient(135deg,var(--color-surface)_0_6px,var(--color-charcoal)_6px_12px)] text-muted' },
  lesson: { label: 'Lesson', icon: GraduationCap, cls: 'border-slate bg-[repeating-linear-gradient(45deg,var(--color-surface)_0_6px,var(--color-charcoal)_6px_12px)] text-muted' },
  past: { label: 'Past', icon: Minus, cls: 'border-transparent bg-charcoal text-muted' },
}

/**
 * Rooms × start-time grid for one day. Available / booked / lesson / past / selected
 * are shown by icon + word, never colour alone.
 */
export function ScheduleGrid({
  date,
  ctx,
  now,
  selected,
  onSelect,
  renderDetail,
  linkFor,
  caption,
}: {
  date: DateKey
  ctx: AvailabilityContext
  now: number
  selected?: { roomId: string; startMin: number } | null
  onSelect?: (roomId: string, startMin: number) => void
  /** Admin: extra text inside occupied cells (customer/reference). */
  renderDetail?: (cell: Cell) => React.ReactNode
  /** Admin: where an occupied cell should link to (booking or lesson details). */
  linkFor?: (o: Occupant) => string
  caption: string
}) {
  const slots = daySlots(ctx)
  const roomsSorted = [...ctx.rooms].filter((r) => r.active).sort((a, b) => a.number - b.number)
  return (
    <div className="overflow-x-auto">
      <table className="w-full min-w-[20rem] border-separate border-spacing-1 text-sm">
        <caption className="sr-only">{caption}</caption>
        <thead>
          <tr>
            <th scope="col" className="w-20 py-2 text-left text-xs font-normal text-muted">Start</th>
            {roomsSorted.map((r) => (
              <th key={r.id} scope="col" className="py-2 text-center font-display text-lg tracking-wide text-paper">
                {r.name}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {slots.map((m) => (
            <tr key={m}>
              <th scope="row" className="pr-2 text-left font-mono text-xs font-normal whitespace-nowrap text-muted">
                {formatMinutes(m)}
              </th>
              {roomsSorted.map((room) => {
                const cell = cellFor(room, date, m, ctx, now)
                const isSel = selected?.roomId === room.id && selected.startMin === m
                const ui = STATE_UI[cell.state]
                const Icon = isSel ? Check : ui.icon
                const label = isSel ? 'Selected' : ui.label
                const body = (
                  <span className="flex min-h-11 flex-col items-center justify-center gap-0.5 px-1 py-1.5">
                    <span className="flex items-center gap-1.5 text-xs font-semibold">
                      <Icon aria-hidden="true" className="size-3.5 shrink-0" />
                      {label}
                    </span>
                    {renderDetail && cell.occupants.length > 0 && <span className="text-[0.7rem] leading-tight text-paper">{renderDetail(cell)}</span>}
                  </span>
                )
                const a11y = `${room.name}, ${formatMinutes(m)}: ${label}`
                return (
                  <td key={room.id} className="p-0">
                    {linkFor && cell.occupants[0] ? (
                      <Link
                        to={linkFor(cell.occupants[0])}
                        aria-label={`${a11y}, ${cell.occupants.map((o) => o.reference).join(', ')} — open details`}
                        className={`block w-full border-2 no-underline transition-colors hover:border-paper focus-visible:border-paper ${ui.cls}`}
                      >
                        {body}
                      </Link>
                    ) : onSelect && cell.state === 'free' ? (
                      <button
                        type="button"
                        onClick={() => onSelect(room.id, m)}
                        aria-pressed={isSel}
                        aria-label={a11y}
                        className={`w-full border-2 transition-colors ${isSel ? 'border-paper bg-paper text-ink' : ui.cls}`}
                      >
                        {body}
                      </button>
                    ) : (
                      <div aria-label={a11y} role="img" className={`w-full border-2 ${isSel ? 'border-paper bg-paper text-ink' : ui.cls}`}>
                        {body}
                      </div>
                    )}
                  </td>
                )
              })}
            </tr>
          ))}
        </tbody>
      </table>
      <ul className="mt-3 flex flex-wrap gap-x-5 gap-y-2 text-xs text-muted" aria-label="Legend">
        {(['free', 'booked', 'lesson', 'past'] as const).map((k) => {
          const L = STATE_UI[k]
          return (
            <li key={k} className="flex items-center gap-1.5">
              <L.icon aria-hidden="true" className="size-3.5" /> {L.label}
            </li>
          )
        })}
        {onSelect && (
          <li className="flex items-center gap-1.5">
            <Check aria-hidden="true" className="size-3.5" /> Selected
          </li>
        )}
      </ul>
    </div>
  )
}
