import { Link } from 'react-router'
import { ArrowRight } from 'lucide-react'
import { PageHeader, SectionTitle } from '../../components/ui/PageHeader'
import { useTitle } from '../../components/ui/useTitle'
import { RentalTable } from '../../features/inventory/RentalTable'
import { PolicyNotice } from '../../features/booking/PolicyNotice'
import { PriceReceipt } from '../../features/booking/ExampleReceipt'
import { handoffExample } from '../../features/booking/pricing'
import { TapeLabel } from '../../components/grunge'
import { defaultSettings } from '../../data/settings'
import { formatPHP, formatPHPOrTbd } from '../../utils/money'
import { formatDuration } from '../../utils/duration'

export function RatesPage() {
  useTitle('Rates')
  const s = defaultSettings
  const rows = [
    { service: 'Band rehearsal', price: `${formatPHP(s.roomRatePerHour)} per hour`, notes: 'Per room; standard equipment included' },
    { service: 'Lesson — beginner', price: `${formatPHPOrTbd(s.lessonPrices.beginner)} per session`, notes: `One-on-one; ${formatDuration(s.lessonDurationMinutes.beginner)}; in a studio room` },
    { service: 'Lesson — intermediate', price: `${formatPHPOrTbd(s.lessonPrices.intermediate)} per session`, notes: `One-on-one; ${formatDuration(s.lessonDurationMinutes.intermediate)}; in a studio room` },
    { service: 'Live gig streaming', price: `${formatPHP(s.streamingRatePerHour)} per hour`, notes: 'Packages and details to be confirmed' },
  ]
  return (
    <>
      <PageHeader eyebrow="Rates" title="What it costs." photo="drumsStripes">
        All prices in Philippine pesos.
      </PageHeader>

      <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6" aria-labelledby="rates-title">
        <SectionTitle eyebrow="Services" id="rates-title">Base rates</SectionTitle>
        <div className="mt-6 overflow-x-auto">
          <table className="w-full min-w-[34rem] border-collapse text-left">
            <caption className="sr-only">Service rates</caption>
            <thead>
              <tr className="border-b-2 border-paper">
                <th scope="col" className="eyebrow py-3 pr-4 font-normal text-muted">Service</th>
                <th scope="col" className="eyebrow py-3 pr-4 text-right font-normal text-muted">Price</th>
                <th scope="col" className="eyebrow py-3 font-normal text-muted">Notes</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((r) => (
                <tr key={r.service} className="border-b border-slate">
                  <th scope="row" className="py-4 pr-4 font-semibold">{r.service}</th>
                  <td className="py-4 pr-4 text-right font-mono text-lg font-bold whitespace-nowrap">{r.price}</td>
                  <td className="py-4 text-sm text-muted">{r.notes}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <section className="border-y border-slate bg-surface" aria-labelledby="addons-title">
        <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6">
          <SectionTitle eyebrow="Rehearsal add-ons" id="addons-title">Optional rentals</SectionTitle>
          <p className="mt-3 max-w-2xl text-paper/90">
            Charged <strong>once per reservation</strong>, however many hours you book. Stock is shared by all three rooms.
          </p>
          <div className="mt-6">
            <RentalTable />
          </div>
        </div>
      </section>

      <section className="mx-auto grid max-w-7xl gap-12 px-4 py-16 sm:px-6 lg:grid-cols-2">
        <div>
          <SectionTitle eyebrow="Worked example">How a total adds up</SectionTitle>
          <ul className="mt-4 space-y-1 text-paper/90">
            <li>3 hours × {formatPHP(s.roomRatePerHour)} = {formatPHP(750)}</li>
            <li>2 guitar cables × {formatPHP(40)} = {formatPHP(80)}</li>
            <li>1 extra mic kit × {formatPHP(40)} = {formatPHP(40)}</li>
            <li>1 keyboard kit × {formatPHP(100)} = {formatPHP(100)}</li>
            <li className="pt-2 font-semibold">Total {formatPHP(handoffExample.total)} · downpayment {formatPHP(handoffExample.downpayment)} · balance {formatPHP(handoffExample.balance)}</li>
          </ul>
          <PolicyNotice className="mt-8" />
          <Link to="/book" className="btn btn-primary mt-8">
            Book a room <ArrowRight aria-hidden="true" className="size-5" />
          </Link>
        </div>
        <div className="relative mx-auto w-full max-w-sm">
          <TapeLabel tone="rust" rotate={-3} className="absolute -top-3 left-4 z-10">Example only</TapeLabel>
          <PriceReceipt price={handoffExample} title="Example booking" />
        </div>
      </section>
    </>
  )
}
