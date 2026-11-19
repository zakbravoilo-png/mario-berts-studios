import { Link } from 'react-router'
import { ArrowRight, Check } from 'lucide-react'
import { PageHeader, SectionTitle } from '../../components/ui/PageHeader'
import { useTitle } from '../../components/ui/useTitle'
import { PolicyNotice } from '../../features/booking/PolicyNotice'
import { PriceReceipt } from '../../features/booking/ExampleReceipt'
import { handoffExample } from '../../features/booking/pricing'
import { RentalTable } from '../../features/inventory/RentalTable'
import { TapeLabel } from '../../components/grunge'
import { includedEquipment } from '../../data/rooms'
import { defaultSettings } from '../../data/settings'
import { formatPHP } from '../../utils/money'

export function RehearsalPage() {
  useTitle('Band rehearsal')
  const s = defaultSettings
  return (
    <>
      <PageHeader eyebrow="Services / Band rehearsal" title={<>{formatPHP(s.roomRatePerHour)} an hour. Gear included.</>} photo="bandRehearsal">
        Book Room 1, 2 or 3 between 9:00 AM and 9:00 PM (Asia/Manila). Each room is booked on its own and comes with the
        full standard kit.
      </PageHeader>

      <section className="mx-auto grid max-w-7xl gap-12 px-4 py-16 sm:px-6 lg:grid-cols-2" aria-labelledby="included-title">
        <div>
          <SectionTitle eyebrow="Included in every room" id="included-title">
            Standard kit — no extra charge
          </SectionTitle>
          <ul className="mt-6 space-y-3">
            {includedEquipment.map((e) => (
              <li key={e.id} className="flex items-start gap-3">
                <Check aria-hidden="true" className="mt-1 size-5 shrink-0 text-rust-light" />
                <span>
                  <strong>
                    {e.quantity} × {e.name}
                  </strong>
                  {e.note && <span className="block text-sm text-muted">{e.note}</span>}
                </span>
              </li>
            ))}
          </ul>
          <p className="mt-6 text-paper/90">You can always bring your own instruments.</p>
        </div>
        <div>
          <SectionTitle eyebrow="How the price works">Room + gear, once</SectionTitle>
          <ul className="mt-6 list-disc space-y-2 pl-5 text-paper/90 marker:text-rust-light">
            <li>
              Room: hours × {formatPHP(s.roomRatePerHour)}. Bookings use whole hours in this prototype (demo setting; slot
              size to be confirmed by the studio).
            </li>
            <li>Extra gear: each item&apos;s price is charged once per booking, not per hour.</li>
            <li>Downpayment: 50% of the total, via GCash, when you book. The other 50% is paid after your rehearsal, in cash at the studio or by GCash.</li>
          </ul>
          <div className="relative mt-8 max-w-sm">
            <TapeLabel tone="rust" rotate={-3} className="absolute -top-3 left-4 z-10">
              Example only
            </TapeLabel>
            <PriceReceipt price={handoffExample} title="Example booking" />
          </div>
        </div>
      </section>

      <section className="border-y border-slate bg-surface" aria-labelledby="extras-title">
        <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6">
          <SectionTitle eyebrow="Optional rentals" id="extras-title">
            Extra gear
          </SectionTitle>
          <p className="mt-3 max-w-2xl text-paper/90">Stock is shared by all three rooms, so what&apos;s free depends on your time slot.</p>
          <div className="mt-6">
            <RentalTable />
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6">
        <PolicyNotice className="max-w-3xl" />
        <Link to="/book" className="btn btn-primary mt-8">
          Book a room <ArrowRight aria-hidden="true" className="size-5" />
        </Link>
      </section>
    </>
  )
}
