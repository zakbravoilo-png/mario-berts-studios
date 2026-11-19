import { Link } from 'react-router'
import { ArrowRight, Check } from 'lucide-react'
import { DuotoneImage, Grain, Tape, TapeLabel } from '../../components/grunge'
import { includedEquipment, rooms } from '../../data/rooms'

export function RoomsSection() {
  return (
    <section aria-labelledby="rooms-title" className="relative overflow-hidden bg-charcoal">
      <Grain fine={0.16} coarse={0.28} />
      <div className="relative mx-auto grid max-w-7xl gap-16 px-4 py-20 sm:px-6 lg:grid-cols-[1fr_1.1fr] lg:py-28">
        {/* Photo stack */}
        <div className="relative order-2 pb-24 lg:order-1 lg:self-center">
          <div className="relative -rotate-2 drop-shadow-[10px_10px_0_rgba(0,0,0,0.5)]">
            <DuotoneImage photo="room2" torn={21} className="aspect-[4/3] w-full" sizes="(min-width: 1024px) 45vw, 100vw" />
            <Tape className="-top-3 left-1/3" rotate={4} />
          </div>
          <div className="absolute right-0 bottom-0 w-[42%] rotate-[5deg] drop-shadow-[8px_8px_0_rgba(0,0,0,0.5)] sm:-right-4">
            <DuotoneImage photo="rehearsalFisheye" torn={33} className="aspect-[3/4] w-full" sizes="(min-width: 1024px) 20vw, 45vw" />
            <Tape className="-top-3 left-4 !w-20" rotate={-14} />
          </div>
          <p className="marker absolute bottom-3 left-2 max-w-[55%] -rotate-3 text-lg text-paper">
            1 speaker by the drummer, 2 facing the band
          </p>
        </div>

        <div className="order-1 lg:order-2">
          <p className="eyebrow text-muted">02 — The rooms</p>
          <h2 id="rooms-title" className="display mt-2 text-display-2 text-paper">
            Every room comes <span className="emph text-rust-light">loaded</span>
          </h2>
          <p className="mt-4 max-w-lg text-paper/90">
            {rooms.map((r) => r.name).join(', ').replace(/, ([^,]*)$/, ' and $1')} are each independently bookable, and
            each has the same standard kit — included in the hourly rate, never a paid add-on.
          </p>

          <div className="mt-8 flex items-center gap-3">
            <TapeLabel rotate={-2}>
              <Check aria-hidden="true" className="size-3.5" /> Included — no extra charge
            </TapeLabel>
          </div>

          {/* Included kit. Plain panels — no texture behind text. */}
          <ul className="relative mt-5 grid grid-cols-2 gap-px overflow-hidden border border-slate bg-slate sm:grid-cols-3">
            {includedEquipment.map((e) => (
              <li key={e.id} className="bg-ink p-4">
                <span className="display block text-[2.6rem] leading-none text-paper">{e.quantity}</span>
                <span className="mt-1 block text-sm font-semibold text-paper">{e.name}</span>
                {e.note && <span className="mt-1 block text-xs text-muted">{e.note}</span>}
              </li>
            ))}
          </ul>
          <p className="mt-4 text-sm text-muted">Bring your own instruments any time.</p>

          <Link to="/rooms" className="link mt-6 inline-flex items-center gap-2 font-semibold">
            Meet the rooms <ArrowRight aria-hidden="true" className="size-4" />
          </Link>
        </div>
      </div>
    </section>
  )
}
