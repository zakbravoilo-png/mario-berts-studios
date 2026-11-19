import { Link } from 'react-router'
import { ArrowLeft } from 'lucide-react'
import { NoiseOverlay, Tape } from '../components/grunge'

export function NotFoundPage() {
  return (
    <section className="wall relative overflow-hidden">
      <NoiseOverlay opacity={0.14} />
      <div className="relative mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:py-28">
        <p className="eyebrow text-muted">Error 404 · Page not found</p>
        <h1 className="mt-3 font-dirt text-mega leading-[0.85] text-paper" aria-describedby="nf-desc">
          Wrong
          <br />
          room.
        </h1>
        <div className="relative mt-10 max-w-md">
          <Tape className="-top-3 left-6" rotate={-4} />
          <div className="paper-band on-paper p-6 pt-8">
            <p id="nf-desc" className="text-base">
              There&apos;s nothing booked at this address. The page may have moved, or the link is mistyped.
            </p>
            <div className="mt-5 flex flex-wrap gap-3">
              <Link to="/" className="btn btn-ink">
                <ArrowLeft aria-hidden="true" className="size-5" /> Back home
              </Link>
              <Link to="/rooms" className="link self-center">
                See the rooms
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
