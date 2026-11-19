import { Wrench } from 'lucide-react'
import { useDemoState } from '../../services/demoStore'
import { formatPHP } from '../../utils/money'
import type { RentalEquipment } from '../../types/domain'

/** Optional rentals: price per reservation and studio-wide shared stock. Plain table, no texture. Reads the live catalog. */
export function RentalTable({ items, caption = 'Optional equipment rentals: price per reservation and studio-wide stock' }: { items?: RentalEquipment[]; caption?: string }) {
  const s = useDemoState()
  const list = items ?? s.rentals.filter((r) => r.active)
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
          {list.map((r) => (
            <tr key={r.id} className="border-b border-slate">
              <th scope="row" className="py-3 pr-4 font-semibold text-paper">
                {r.name}
                {r.note && <span className="block text-xs font-normal text-muted">{r.note}</span>}
                {r.outOfService && (
                  <span className="mt-1 flex items-center gap-1 text-xs font-normal text-muted">
                    <Wrench aria-hidden="true" className="size-3.5" /> Out of service for now
                  </span>
                )}
              </th>
              <td className="py-3 pr-4 text-right font-mono text-lg font-bold whitespace-nowrap text-paper">
                {formatPHP(r.unitPrice)}
                <span className="ml-1 text-xs font-normal text-muted">{r.pricingUnit === 'per_kit' ? 'kit' : 'each'}</span>
              </td>
              <td className="py-3 text-right font-mono text-paper">{r.outOfService ? '0' : r.totalQuantity ?? 'TBD'}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
