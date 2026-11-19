import { rentalEquipment } from '../../data/rentalEquipment'
import { formatPHP } from '../../utils/money'
import type { RentalEquipment } from '../../types/domain'

/** Optional rentals: price per reservation and studio-wide shared stock. Plain table, no texture. */
export function RentalTable({ items = rentalEquipment, caption = 'Optional equipment rentals: price per reservation and studio-wide stock' }: { items?: RentalEquipment[]; caption?: string }) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full min-w-[30rem] border-collapse text-left">
        <caption className="sr-only">{caption}</caption>
        <thead>
          <tr className="border-b-2 border-paper">
            <th scope="col" className="eyebrow py-3 pr-4 font-normal text-muted">Item</th>
            <th scope="col" className="eyebrow py-3 pr-4 text-right font-normal text-muted">Per booking</th>
            <th scope="col" className="eyebrow py-3 text-right font-normal text-muted">In studio (shared)</th>
          </tr>
        </thead>
        <tbody>
          {items.map((r) => (
            <tr key={r.id} className="border-b border-slate">
              <th scope="row" className="py-3 pr-4 font-semibold text-paper">
                {r.name}
                {r.note && <span className="block text-xs font-normal text-muted">{r.note}</span>}
              </th>
              <td className="py-3 pr-4 text-right font-mono text-lg font-bold whitespace-nowrap text-paper">
                {formatPHP(r.unitPrice)}
                <span className="ml-1 text-xs font-normal text-muted">{r.pricingUnit === 'per_kit' ? 'kit' : 'each'}</span>
              </td>
              <td className="py-3 text-right font-mono text-paper">{r.totalQuantity ?? 'TBD'}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
