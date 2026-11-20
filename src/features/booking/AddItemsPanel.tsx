import { useId, useState } from 'react'
import { Plus } from 'lucide-react'
import type { RehearsalBooking } from '../../types/domain'
import { useDemoState, availabilityContext } from '../../services/demoStore'
import { addBookingEquipment } from '../../services/actions'
import { addItemsBlockedReason, addableQty, type AddedBy } from './addItems'
import { useNow } from './useNow'
import { Callout } from '../../components/ui/Callout'
import { formatPHP } from '../../utils/money'

/**
 * Add rental items to an existing booking (forgotten cables, an instrument left at home).
 * Used on the customer's booking page (until the session starts) and in the admin
 * (until it ends). Added items go onto the balance; the downpayment doesn't change.
 */
export function AddItemsPanel({ booking: b, by }: { booking: RehearsalBooking; by: AddedBy }) {
  const s = useDemoState()
  const now = useNow(30_000)
  const titleId = useId()
  const [qty, setQty] = useState<Record<string, number>>({})
  const [msg, setMsg] = useState<{ ok: boolean; text: string } | null>(null)

  const blocked = addItemsBlockedReason(b, by, now)
  const ctx = availabilityContext(s)
  const items = s.rentals.filter((r) => r.active)
  const chosen = items.filter((r) => (qty[r.id] ?? 0) > 0)
  const extra = chosen.reduce((sum, r) => sum + (qty[r.id] ?? 0) * r.unitPrice, 0)
  const isStaff = by === 'studio'
  const box = isStaff ? 'border border-slate p-4' : 'border border-slate p-5'
  const heading = isStaff ? 'font-semibold' : 'font-display text-xl tracking-wide'

  function add() {
    const r = addBookingEquipment(b.id, chosen.map((x) => ({ itemId: x.id, quantity: qty[x.id] ?? 0 })), by)
    if (r.ok) {
      setQty({})
      setMsg({ ok: true, text: `Added. ${formatPHP(r.value)} goes onto the balance${isStaff ? ' (customer notified, demo)' : ''}.` })
    } else setMsg({ ok: false, text: r.errors.join(' ') })
  }

  // Customers only see the panel while it's usable; staff also see why it's closed.
  if (blocked && !isStaff) return null

  return (
    <section aria-labelledby={titleId} className={box}>
      <h2 id={titleId} className={heading}>{isStaff ? 'Add rental items' : 'Forgot something? Add rental items'}</h2>
      {blocked ? (
        <p className="mt-2 text-sm text-muted">{blocked}</p>
      ) : (
        <>
          <p className="mt-2 text-sm text-paper/90">
            {isStaff
              ? 'For items asked for on the day. Charged once, added to the balance paid after the rehearsal; the downpayment stays the same. Only stock available across all rooms for this booking’s time can be added.'
              : 'Forgot a cable or an instrument? Add rental items until your session starts. They’re charged once and added to the balance you pay after the rehearsal (cash or GCash). On the day, ask the studio staff.'}
          </p>
          <table className="mt-4 w-full text-left text-sm">
            <caption className="sr-only">Rental items you can add</caption>
            <thead>
              <tr className="text-xs text-muted">
                <th scope="col" className="py-1 pr-2 font-semibold">Item</th>
                <th scope="col" className="py-1 pr-2 text-right font-semibold">Price</th>
                <th scope="col" className="py-1 pr-2 text-right font-semibold">Available now</th>
                <th scope="col" className="py-1 text-right font-semibold">Add</th>
              </tr>
            </thead>
            <tbody>
              {items.map((r) => {
                const free = addableQty(b, r, ctx)
                return (
                  <tr key={r.id} className="border-t border-slate">
                    <th scope="row" className="py-2 pr-2 font-normal">
                      {r.name}
                      {r.outOfService && <span className="ml-1 text-xs text-muted">(out of service)</span>}
                    </th>
                    <td className="py-2 pr-2 text-right font-mono">{formatPHP(r.unitPrice)}</td>
                    <td className="py-2 pr-2 text-right font-mono">{free === 0 ? <span className="text-muted">None</span> : free}</td>
                    <td className="py-2 text-right">
                      <label className="sr-only" htmlFor={`${titleId}-${r.id}`}>Quantity of {r.name} to add</label>
                      <select
                        id={`${titleId}-${r.id}`}
                        className="min-h-9 rounded-md border border-slate bg-ink px-2 text-sm text-paper disabled:opacity-50"
                        value={qty[r.id] ?? 0}
                        disabled={free === 0}
                        onChange={(e) => {
                          setMsg(null)
                          setQty((q) => ({ ...q, [r.id]: Number(e.target.value) }))
                        }}
                      >
                        {Array.from({ length: Math.min(free, 10) + 1 }, (_, n) => (
                          <option key={n} value={n}>{n}</option>
                        ))}
                      </select>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
          <div className="mt-4 flex flex-wrap items-center justify-between gap-3 border-t border-slate pt-4">
            <p className="text-sm">
              {chosen.length === 0 ? (
                <span className="text-muted">Choose the items to add.</span>
              ) : (
                <>Adds <strong className="font-mono">{formatPHP(extra)}</strong> · new balance <strong className="font-mono">{formatPHP(b.balance + extra)}</strong></>
              )}
            </p>
            <button type="button" className={isStaff ? 'inline-flex min-h-9 items-center gap-1.5 border border-rust bg-rust px-3 text-sm font-semibold text-paper hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-50' : 'btn btn-primary'} disabled={chosen.length === 0} onClick={add}>
              <Plus aria-hidden="true" className="size-4" /> Add to booking
            </button>
          </div>
        </>
      )}
      {msg && <Callout className="mt-4" tone={msg.ok ? 'success' : 'error'} title={msg.text} />}
    </section>
  )
}
