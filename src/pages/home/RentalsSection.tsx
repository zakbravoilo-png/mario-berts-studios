import { Link } from 'react-router'
import { ArrowRight, Info } from 'lucide-react'
import { rentalEquipment } from '../../data/rentalEquipment'
import { formatPHP } from '../../utils/money'

/** Optional add-ons. Clean surface table — no texture behind prices. */
export function RentalsSection() {
  return (
    <section aria-labelledby="rentals-title" className="border-y border-slate bg-surface">
      <div className="mx-auto grid max-w-7xl gap-10 px-4 py-16 sm:px-6 lg:grid-cols-[0.8fr_1.2fr] lg:py-20">
        <div>
          <p className="eyebrow text-muted">03 — Extra gear</p>
          <h2 id="rentals-title" className="display mt-2 text-display-2 text-paper">
            Need more gear?
          </h2>
          <p className="mt-4 max-w-md text-paper/90">
            Add optional rentals to any rehearsal booking. Each item is charged <strong>once per reservation</strong> — book
            one hour or six, the price is the same.
          </p>
          <div className="mt-6 flex max-w-md gap-3 border border-slate bg-ink p-4 text-sm">
            <Info aria-hidden="true" className="mt-0.5 size-5 shrink-0 text-rust-light" />
            <p className="text-paper/90">
              Rental stock is shared by all three rooms, so what&apos;s free depends on your time slot. You&apos;ll see live
              availability (demo data in this prototype) when you book.
            </p>
          </div>
          <Link to="/rates" className="link mt-6 inline-flex items-center gap-2 font-semibold">
            Full rates <ArrowRight aria-hidden="true" className="size-4" />
          </Link>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full min-w-[30rem] border-collapse text-left">
            <caption className="sr-only">Optional equipment rentals, price per reservation and studio-wide stock</caption>
            <thead>
              <tr className="border-b-2 border-paper">
                <th scope="col" className="eyebrow py-3 pr-4 font-normal text-muted">Item</th>
                <th scope="col" className="eyebrow py-3 pr-4 text-right font-normal text-muted">Per booking</th>
                <th scope="col" className="eyebrow py-3 text-right font-normal text-muted">In studio</th>
              </tr>
            </thead>
            <tbody>
              {rentalEquipment.map((r) => (
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
      </div>
    </section>
  )
}
