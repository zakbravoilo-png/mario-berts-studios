import { Link } from 'react-router'
import { ArrowRight, Guitar, RadioTower } from 'lucide-react'
import { DuotoneImage } from '../../components/grunge'
import { shopCategories } from '../../data/services'
import { useDemoState } from '../../services/demoStore'
import { defaultSettings } from '../../data/settings'
import { formatPHP } from '../../utils/money'

/** Streaming + shop teasers. Clean cards, slate borders. */
export function MoreSection() {
  const { products } = useDemoState()
  return (
    <section aria-labelledby="more-title" className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:py-24">
      <p className="eyebrow text-muted">06 — Also at the studio</p>
      <h2 id="more-title" className="display mt-2 text-display-2 text-paper">
        Stream it. String it. Stick it.
      </h2>

      <div className="mt-10 grid gap-6 md:grid-cols-2">
        <article className="card flex flex-col overflow-hidden">
          <DuotoneImage photo="liveBw" className="aspect-[16/7] w-full border-b border-slate" sizes="(min-width: 768px) 50vw, 100vw" />
          <div className="flex flex-1 flex-col p-6">
            <div className="flex items-center gap-3">
              <RadioTower aria-hidden="true" className="size-6 text-rust-light" />
              <h3 className="display text-display-3">Live gig streaming</h3>
            </div>
            <p className="mt-3 font-mono text-2xl font-bold">
              {formatPHP(defaultSettings.streamingRatePerHour)} <span className="text-base font-normal text-muted">/ hour</span>
            </p>
            <p className="mt-3 flex-1 text-sm text-muted">
              Tell us the date, venue and how long you&apos;ll play. Packages and technical details are to be confirmed by the
              studio — every request is an inquiry until they reply.
            </p>
            <Link to="/book/streaming" className="link mt-5 inline-flex items-center gap-2 font-semibold">
              Send a streaming inquiry <ArrowRight aria-hidden="true" className="size-4" />
            </Link>
          </div>
        </article>

        <article className="card flex flex-col p-6">
          <div className="flex items-center gap-3">
            <Guitar aria-hidden="true" className="size-6 text-rust-light" />
            <h3 className="display text-display-3">Strings &amp; sticks</h3>
          </div>
          <p className="mt-3 text-sm text-muted">Kuting-Kuting Music City Strings and drumsticks. Ask first — no online checkout.</p>
          <ul className="mt-6 divide-y divide-slate border-y border-slate">
            {shopCategories.map((c) => {
              const prices = products.filter((x) => x.active && x.category === c.id && x.price !== null).map((x) => x.price as number)
              const low = prices.length ? Math.min(...prices) : null
              return (
                <li key={c.id} className="flex items-center justify-between gap-4 py-4">
                  <span className="font-semibold">{c.label}</span>
                  {low !== null ? <span className="shrink-0 font-mono text-lg font-bold">{prices.length > 1 ? 'from ' : ''}{formatPHP(low)}</span> : <span className="tbd-chip shrink-0 text-muted">Price TBD</span>}
                </li>
              )
            })}
          </ul>
          <p className="mt-4 flex-1 text-xs text-muted">Strings per set. Stock, gauges and stick sizes to be confirmed by the studio.</p>
          <Link to="/shop" className="link mt-5 inline-flex items-center gap-2 font-semibold">
            Browse the shop <ArrowRight aria-hidden="true" className="size-4" />
          </Link>
        </article>
      </div>
    </section>
  )
}
