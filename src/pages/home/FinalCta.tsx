import { Link } from 'react-router'
import { ArrowRight } from 'lucide-react'
import { DuotoneImage, Grain, Highlight, TornEdge } from '../../components/grunge'

export function FinalCta() {
  return (
    <section aria-labelledby="cta-title" className="relative isolate overflow-hidden bg-ink">
      <div className="absolute inset-0 -z-10">
        <DuotoneImage photo="liveBlue" alt="" halftone="coarse" sizes="100vw" className="h-full w-full opacity-60" />
        <div aria-hidden="true" className="absolute inset-0 bg-[linear-gradient(90deg,rgb(20_21_25/0.92)_0%,rgb(20_21_25/0.7)_55%,rgb(20_21_25/0.45)_100%)]" />
        <Grain fine={0.25} coarse={0.45} />
      </div>
      <div className="absolute inset-x-0 top-0">
        <TornEdge className="text-ink" underClassName="text-slate" side="bottom" seed={61} height={44} />
      </div>
      <div className="relative mx-auto flex max-w-7xl flex-col items-start gap-8 px-4 py-20 sm:px-6 md:flex-row md:items-center md:justify-between lg:py-28">
        <div>
          <h2 id="cta-title" className="display text-display-1 text-paper">
            Ready when
            <br />
            you <Highlight>are.</Highlight>
          </h2>
          <p className="marker mt-4 -rotate-2 text-xl text-paper">doors open 9 AM — amps off 9 PM</p>
        </div>
        <div className="flex flex-col gap-4">
          <Link to="/book" className="btn btn-primary text-xl">
            Book a room <ArrowRight aria-hidden="true" className="size-5" />
          </Link>
          <Link to="/contact" className="link text-sm font-semibold">
            Questions? Contact the studio
          </Link>
        </div>
      </div>
    </section>
  )
}
