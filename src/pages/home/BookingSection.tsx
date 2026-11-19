import { Link } from 'react-router'
import { ArrowRight, CalendarCheck } from 'lucide-react'
import { Grain, Receipt, TapeLabel, TicketStub } from '../../components/grunge'
import { priceRehearsal } from '../../features/booking/pricing'
import { formatPHP } from '../../utils/money'

const steps = [
  { n: '01', title: 'Pick a date & time', body: 'See which of the three rooms are free, 9 AM to 9 PM.' },
  { n: '02', title: 'Choose your room', body: 'Every room has the same standard kit included.' },
  { n: '03', title: 'Add extra gear', body: 'Optional rentals, charged once per booking, limited by shared stock.' },
  { n: '04', title: 'Confirm with GCash', body: 'Send your GCash reference and the studio confirms your booking.' },
]

/** Worked example from the handoff (§5B): must total 970 / 485 / 485. */
const example = priceRehearsal(3, [
  { itemId: 'guitar-cable', quantity: 2 },
  { itemId: 'mic-kit', quantity: 1 },
  { itemId: 'keyboard-kit', quantity: 1 },
])

export function BookingSection() {
  return (
    <section aria-labelledby="booking-title" className="wall relative overflow-hidden">
      <Grain fine={0.2} coarse={0.32} />
      <div className="relative mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:py-28">
        <p className="eyebrow text-muted">04 — How booking works</p>
        <h2 id="booking-title" className="display mt-2 max-w-3xl text-display-2 text-paper">
          Four steps from <span className="emph text-rust-light">idea</span> to <span className="emph text-rust-light">noise</span>
        </h2>

        <div className="mt-12 grid gap-12 lg:grid-cols-[1fr_1fr] lg:gap-16">
          <div>
            <ol className="space-y-4">
              {steps.map((s) => (
                <li key={s.n} className="card flex gap-5 p-5">
                  <span className="display text-4xl leading-none text-rust-light" aria-hidden="true">
                    {s.n}
                  </span>
                  <div>
                    <h3 className="text-lg font-bold text-paper">
                      <span className="sr-only">Step {Number(s.n)}: </span>
                      {s.title}
                    </h3>
                    <p className="mt-1 text-sm text-muted">{s.body}</p>
                  </div>
                </li>
              ))}
            </ol>

            {/* Friendly summary. Full payment terms are shown in the booking flow before anyone commits. */}
            <div role="note" aria-labelledby="policy-title" className="mt-8 border border-slate bg-ink p-5">
              <div className="flex items-start gap-3">
                <CalendarCheck aria-hidden="true" className="mt-0.5 size-6 shrink-0 text-rust-light" />
                <div>
                  <h3 id="policy-title" className="font-display text-xl tracking-wide text-paper">
                    Good to know
                  </h3>
                  <ul className="mt-2 list-disc space-y-1.5 pl-5 text-sm text-paper/90 marker:text-rust-light">
                    <li>
                      Plans changed? Cancel any time <strong>before the day</strong> of your booking and your payment is{' '}
                      <strong>returned via GCash</strong>.
                    </li>
                    <li>Bookings can&apos;t be cancelled on the day itself.</li>
                    <li>You&apos;ll see the full price and payment details before you confirm.</li>
                  </ul>
                  <p className="mt-3 text-xs text-muted">
                    Prototype: GCash is simulated. No payment is processed and no GCash number is shown until the studio
                    provides one.
                  </p>
                </div>
              </div>
            </div>

            <Link to="/book" className="btn btn-primary mt-8">
              Start a booking <ArrowRight aria-hidden="true" className="size-5" />
            </Link>
          </div>

          {/* Signature: receipt + ticket */}
          <div className="relative">
            <TapeLabel tone="rust" rotate={-3} className="absolute -top-3 left-4 z-10">
              Example only
            </TapeLabel>
            <div className="mx-auto max-w-sm rotate-[1.5deg] drop-shadow-[8px_8px_0_rgba(0,0,0,0.6)]">
              <Receipt
                title="Example booking"
                lines={[
                  {
                    label: `Room · ${example.hours} hrs × ${formatPHP(example.roomRate)}`,
                    amount: example.roomSubtotal,
                  },
                  ...example.equipmentLines.map((l) => ({
                    label: `${l.label} × ${l.quantity}`,
                    detail: 'once per booking',
                    amount: l.lineTotal,
                  })),
                ]}
                total={example.total}
                footer={<>Extra gear is charged once, not per hour. Free cancellation before the booking day.</>}
              />
            </div>

            <div className="mt-10 -rotate-[1.5deg]">
              <TicketStub
                reference="MBS-0000-0000"
                title="Room 2 · Sample"
                status={<span className="tape-label tape-label--rust">Sample ticket</span>}
                fields={[
                  { label: 'Date', value: 'Your date' },
                  { label: 'Time', value: '3 hrs' },
                  { label: 'Room', value: 'Room 2' },
                  { label: 'Total', value: formatPHP(example.total) },
                  { label: 'Extra gear', value: '4 items' },
                  { label: 'Status', value: 'Awaiting verification' },
                ]}
                footnote="This is what your reservation will look like in the customer portal."
              />
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
