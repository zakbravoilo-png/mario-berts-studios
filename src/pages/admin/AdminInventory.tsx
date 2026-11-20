import { useMemo, useState, type FormEvent } from 'react'
import { Plus, RotateCcw, Trash2 } from 'lucide-react'
import { availabilityContext, useDemoState } from '../../services/demoStore'
import { adminAddRental, adminRemoveRental, adminRestoreRental, adminSetOutOfService, adminUpdateRental } from '../../services/actions'
import { availableQty, overlaps, rehearsalHolds } from '../../features/booking/availability'
import { PortalHeader } from '../../components/ui/PortalHeader'
import { Callout } from '../../components/ui/Callout'
import { AdminButton, Table, Td, Th, adminInput } from '../../features/admin/adminUi'
import { formatPHP } from '../../utils/money'
import { roomName } from '../../data/rooms'
import { formatDate, formatMinutes, manilaIso, todayManila } from '../../utils/time'
import { equipmentLabel } from '../../data/rentalEquipment'
import type { RentalEquipment } from '../../types/domain'

const toInt = (v: string) => (v.trim() === '' ? NaN : Number(v))

/** One editable catalog row: name, price, stock, unit, out-of-service, remove. */
function RentalRow({ r, free }: { r: RentalEquipment; free: number | null }) {
  const [d, setD] = useState({ name: r.name, price: String(r.unitPrice), stock: String(r.totalQuantity ?? 0), unit: r.pricingUnit })
  const [msg, setMsg] = useState<{ ok: boolean; text: string } | null>(null)
  const [confirmRemove, setConfirmRemove] = useState(false)
  const dirty = d.name !== r.name || d.price !== String(r.unitPrice) || d.stock !== String(r.totalQuantity ?? 0) || d.unit !== r.pricingUnit

  function save() {
    const res = adminUpdateRental(r.id, { name: d.name, unitPrice: toInt(d.price), totalQuantity: toInt(d.stock), pricingUnit: d.unit })
    setMsg(res.ok ? { ok: true, text: 'Saved.' } : { ok: false, text: res.errors.join(' ') })
  }

  return (
    <tr className={r.outOfService ? 'bg-charcoal' : undefined}>
      <Td>
        <input aria-label={`Name of ${r.name}`} className={`${adminInput} w-full min-w-44`} value={d.name} onChange={(e) => { setD({ ...d, name: e.target.value }); setMsg(null) }} />
        {r.note && <span className="mt-1 block text-xs text-muted">{r.note}</span>}
      </Td>
      <Td>
        <label className="flex items-center gap-1">
          <span aria-hidden="true">₱</span>
          <input aria-label={`Price per booking for ${r.name}`} inputMode="numeric" className={`${adminInput} w-20`} value={d.price} onChange={(e) => { setD({ ...d, price: e.target.value }); setMsg(null) }} />
        </label>
        <select aria-label={`Price unit for ${r.name}`} className={`${adminInput} mt-1`} value={d.unit} onChange={(e) => setD({ ...d, unit: e.target.value as RentalEquipment['pricingUnit'] })}>
          <option value="per_item">each</option>
          <option value="per_kit">per kit</option>
        </select>
      </Td>
      <Td>
        <input aria-label={`Total stock for ${r.name}`} inputMode="numeric" className={`${adminInput} w-16`} value={d.stock} onChange={(e) => { setD({ ...d, stock: e.target.value }); setMsg(null) }} />
      </Td>
      <Td className="font-mono font-bold">{r.outOfService ? 'Out of service' : free === null ? '—' : free === 0 ? '0 — none free' : free}</Td>
      <Td>
        <label className="flex items-center gap-2 text-sm whitespace-nowrap">
          <input type="checkbox" className="size-4 accent-[var(--color-rust)]" checked={r.outOfService} onChange={(e) => adminSetOutOfService(r.id, e.target.checked)} aria-label={`${r.name} out of service`} />
          Out of service
        </label>
      </Td>
      <Td>
        <div className="flex flex-wrap items-center gap-1.5">
          <AdminButton tone={dirty ? 'primary' : 'default'} disabled={!dirty} onClick={save}>Save</AdminButton>
          {!confirmRemove ? (
            <AdminButton aria-label={`Remove ${r.name}`} onClick={() => setConfirmRemove(true)}><Trash2 aria-hidden="true" className="size-4" /></AdminButton>
          ) : (
            <>
              <AdminButton tone="primary" onClick={() => adminRemoveRental(r.id)}>Remove</AdminButton>
              <AdminButton onClick={() => setConfirmRemove(false)}>Keep</AdminButton>
            </>
          )}
        </div>
        {msg && <span role={msg.ok ? 'status' : 'alert'} className={`mt-1 block text-xs ${msg.ok ? 'text-muted' : 'text-rust-light'}`}>{msg.text}</span>}
      </Td>
    </tr>
  )
}

function AddRentalForm() {
  const [d, setD] = useState({ name: '', price: '', stock: '', unit: 'per_item' as RentalEquipment['pricingUnit'] })
  const [msg, setMsg] = useState<{ ok: boolean; text: string } | null>(null)
  function submit(e: FormEvent) {
    e.preventDefault()
    const r = adminAddRental({ name: d.name, unitPrice: toInt(d.price), totalQuantity: toInt(d.stock), pricingUnit: d.unit })
    if (!r.ok) return setMsg({ ok: false, text: r.errors.join(' ') })
    setMsg({ ok: true, text: `Added “${d.name.trim()}”. It's now bookable.` })
    setD({ name: '', price: '', stock: '', unit: 'per_item' })
  }
  return (
    <form noValidate onSubmit={submit} aria-labelledby="add-rental-title" className="mt-8 border border-slate p-4">
      <h2 id="add-rental-title" className="font-semibold">Add a rental item</h2>
      <div className="mt-3 flex flex-wrap items-end gap-3 text-sm">
        <label className="min-w-48 flex-1"><span className="mb-1 block text-muted">Name</span><input className={`${adminInput} w-full`} value={d.name} onChange={(e) => setD({ ...d, name: e.target.value })} placeholder="e.g. Cowbell" /></label>
        <label><span className="mb-1 block text-muted">Price per booking (₱)</span><input inputMode="numeric" className={`${adminInput} w-28`} value={d.price} onChange={(e) => setD({ ...d, price: e.target.value })} /></label>
        <label><span className="mb-1 block text-muted">Unit</span>
          <select className={adminInput} value={d.unit} onChange={(e) => setD({ ...d, unit: e.target.value as RentalEquipment['pricingUnit'] })}>
            <option value="per_item">each</option>
            <option value="per_kit">per kit</option>
          </select>
        </label>
        <label><span className="mb-1 block text-muted">Total stock</span><input inputMode="numeric" className={`${adminInput} w-20`} value={d.stock} onChange={(e) => setD({ ...d, stock: e.target.value })} /></label>
        <AdminButton type="submit" tone="primary"><Plus aria-hidden="true" className="size-4" /> Add item</AdminButton>
      </div>
      {msg && <p role={msg.ok ? 'status' : 'alert'} className={`mt-2 text-sm ${msg.ok ? 'text-paper' : 'text-rust-light'}`}>{msg.text}</p>}
    </form>
  )
}

export function AdminInventory() {
  const s = useDemoState()
  const ctx = useMemo(() => availabilityContext(s), [s])
  const [date, setDate] = useState(() => todayManila())
  const [from, setFrom] = useState(11)
  const [to, setTo] = useState(13)
  const range = { startAt: manilaIso(date, `${String(from).padStart(2, '0')}:00`), endAt: manilaIso(date, `${String(to).padStart(2, '0')}:00`) }
  const valid = to > from
  const holders = valid ? s.bookings.filter((b) => rehearsalHolds(b, s.settings) && overlaps(b, range) && b.selectedEquipment.length) : []
  const hours = Array.from({ length: 13 }, (_, i) => 9 + i)
  const active = s.rentals.filter((r) => r.active)
  const removed = s.rentals.filter((r) => !r.active)

  return (
    <>
      <PortalHeader title="Shared inventory" description="Extra rental items, shared by all three rooms. Availability = stock − quantity held by overlapping bookings." />
      <Callout tone="demo" title="Demo data">
        Changes save in this browser only. Price changes apply to new bookings — existing bookings keep the price they were booked at. Out-of-service items stay listed but can&apos;t be booked.
      </Callout>

      <section aria-labelledby="check-title" className="mt-6">
        <h2 id="check-title" className="text-lg font-semibold">Show availability for</h2>
        <div className="mt-3 flex flex-wrap items-end gap-3 text-sm">
          <label><span className="mb-1 block text-muted">Date</span><input type="date" className={adminInput} value={date} onChange={(e) => e.target.value && setDate(e.target.value)} /></label>
          <label><span className="mb-1 block text-muted">From</span>
            <select className={adminInput} value={from} onChange={(e) => setFrom(Number(e.target.value))}>{hours.slice(0, -1).map((h) => <option key={h} value={h}>{formatMinutes(h * 60)}</option>)}</select>
          </label>
          <label><span className="mb-1 block text-muted">To</span>
            <select className={adminInput} value={to} onChange={(e) => setTo(Number(e.target.value))}>{hours.slice(1).map((h) => <option key={h} value={h}>{formatMinutes(h * 60)}</option>)}</select>
          </label>
          <p className="text-muted">{formatDate(date)}</p>
        </div>
        {!valid && <p role="alert" className="mt-2 text-sm text-rust-light">“To” must be after “From”.</p>}
      </section>

      <div className="mt-4">
        <Table caption="Rental items: name, price, stock, availability and status" minWidth="60rem">
          <thead><tr><Th>Item</Th><Th>Price / booking</Th><Th>Stock</Th><Th>Available in range</Th><Th>Status</Th><Th>Actions</Th></tr></thead>
          <tbody>
            {active.map((r) => (
              <RentalRow key={`${r.id}-${r.unitPrice}-${r.totalQuantity}-${r.name}-${r.pricingUnit}`} r={r} free={valid ? availableQty(r.id, range, ctx) : null} />
            ))}
            {active.length === 0 && <tr><Td colSpan={6} className="py-6 text-center text-muted">No rental items. Add one below.</Td></tr>}
          </tbody>
        </Table>
      </div>

      <AddRentalForm />

      {removed.length > 0 && (
        <section aria-labelledby="removed-title" className="mt-8">
          <h2 id="removed-title" className="text-lg font-semibold">Removed items</h2>
          <p className="text-sm text-muted">Hidden from customers. Kept so existing bookings still show them.</p>
          <ul className="mt-2 space-y-2 text-sm">
            {removed.map((r) => (
              <li key={r.id} className="flex flex-wrap items-center gap-3">
                <span>{r.name} · {formatPHP(r.unitPrice)}</span>
                <AdminButton onClick={() => adminRestoreRental(r.id)}><RotateCcw aria-hidden="true" className="size-4" /> Restore</AdminButton>
              </li>
            ))}
          </ul>
        </section>
      )}

      <h2 className="mt-8 text-lg font-semibold">Bookings holding gear in this range</h2>
      <ul className="mt-2 space-y-1 text-sm">
        {holders.length === 0 ? <li className="text-muted">None.</li> : holders.map((b) => (
          <li key={b.id}><span className="font-mono">{b.reference}</span> · {roomName(b.roomId)} · {b.selectedEquipment.map((e) => `${e.quantity}× ${equipmentLabel(e, s.rentals, true)}`).join(', ')}</li>
        ))}
      </ul>
    </>
  )
}
