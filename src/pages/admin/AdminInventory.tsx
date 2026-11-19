import { useMemo, useState } from 'react'
import { availabilityContext, rentalsWithStock, useDemoState } from '../../services/demoStore'
import { adminSetStock } from '../../services/actions'
import { availableQty, overlaps, rehearsalHolds } from '../../features/booking/availability'
import { PortalHeader } from '../../components/ui/PortalHeader'
import { Callout } from '../../components/ui/Callout'
import { AdminButton, Table, Td, Th, adminInput } from '../../features/admin/adminUi'
import { formatPHP } from '../../utils/money'
import { roomName } from '../../data/rooms'
import { formatDate, formatMinutes, manilaIso, todayManila } from '../../utils/time'
import { getRental, rentalEquipment } from '../../data/rentalEquipment'

export function AdminInventory() {
  const s = useDemoState()
  const ctx = useMemo(() => availabilityContext(s), [s])
  const [date, setDate] = useState(() => todayManila())
  const [from, setFrom] = useState(11)
  const [to, setTo] = useState(13)
  const [edit, setEdit] = useState<Record<string, string>>({})
  const range = { startAt: manilaIso(date, `${String(from).padStart(2, '0')}:00`), endAt: manilaIso(date, `${String(to).padStart(2, '0')}:00`) }
  const valid = to > from
  const holders = valid ? s.bookings.filter((b) => rehearsalHolds(b, s.settings) && overlaps(b, range) && b.selectedEquipment.length) : []
  const hours = Array.from({ length: 13 }, (_, i) => 9 + i)

  return (
    <>
      <PortalHeader title="Shared inventory" description="Extra rental stock is shared by all three rooms. Availability = stock − quantity held by overlapping bookings." />
      <Callout tone="demo" title="Mock inventory">Not live stock. Changing totals here only changes demo data. Stock is held while a booking awaits verification (demo setting, owner to confirm).</Callout>

      <section aria-labelledby="check-title" className="mt-6">
        <h2 id="check-title" className="text-lg font-semibold">Check availability for a time range</h2>
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
        <Table caption="Shared rental stock and availability for the selected range">
          <thead><tr><Th>Item</Th><Th className="text-right">Price / booking</Th><Th className="text-right">Total stock</Th><Th className="text-right">Free in range</Th><Th>Adjust total (demo)</Th></tr></thead>
          <tbody>
            {rentalsWithStock(s).map((r) => {
              const free = valid ? availableQty(r.id, range, ctx) : null
              const def = rentalEquipment.find((x) => x.id === r.id)?.totalQuantity
              return (
                <tr key={r.id}>
                  <Td>{r.name}{r.totalQuantity !== def && <span className="block text-xs text-muted">Confirmed stock: {def}</span>}</Td>
                  <Td className="text-right font-mono">{formatPHP(r.unitPrice)}</Td>
                  <Td className="text-right font-mono">{r.totalQuantity ?? 'TBD'}</Td>
                  <Td className="text-right font-mono font-bold">{free === null ? '—' : free === 0 ? '0 — none free' : free}</Td>
                  <Td>
                    <form className="flex items-center gap-2" onSubmit={(e) => { e.preventDefault(); const v = Number(edit[r.id]); if (Number.isFinite(v) && v >= 0) { adminSetStock(r.id, v); setEdit({ ...edit, [r.id]: '' }) } }}>
                      <label className="sr-only" htmlFor={`stock-${r.id}`}>New total for {r.name}</label>
                      <input id={`stock-${r.id}`} type="number" min={0} className={`${adminInput} w-20`} value={edit[r.id] ?? ''} placeholder={String(r.totalQuantity ?? '')} onChange={(e) => setEdit({ ...edit, [r.id]: e.target.value })} />
                      <AdminButton type="submit" disabled={!edit[r.id]}>Set</AdminButton>
                    </form>
                  </Td>
                </tr>
              )
            })}
          </tbody>
        </Table>
      </div>

      <h2 className="mt-8 text-lg font-semibold">Bookings holding gear in this range</h2>
      <ul className="mt-2 space-y-1 text-sm">
        {holders.length === 0 ? <li className="text-muted">None.</li> : holders.map((b) => (
          <li key={b.id}><span className="font-mono">{b.reference}</span> · {roomName(b.roomId)} · {b.selectedEquipment.map((e) => `${e.quantity}× ${getRental(e.itemId).shortName}`).join(', ')}</li>
        ))}
      </ul>
    </>
  )
}
