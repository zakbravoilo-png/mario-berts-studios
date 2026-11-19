import { Link } from 'react-router'
import { ArrowRight } from 'lucide-react'
import { DuotoneImage, Grain, Highlight, Tape, TornEdge } from '../../components/grunge'
import { defaultSettings } from '../../data/settings'
import { formatPHP } from '../../utils/money'

function Squiggle({ className = '' }: { className?: string }) {
  return (
    <svg viewBox="0 0 120 60" className={className} aria-hidden="true" fill="none">
      <path
        d="M4 10 C 30 0, 40 40, 62 30 S 92 8, 104 40 M104 40 l-14 -4 M104 40 l2 -14"
        stroke="currentColor"
        strokeWidth="3.2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
}

export function Hero() {
  const rate = formatPHP(defaultSettings.roomRatePerHour)
  return (
    <section aria-labelledby="hero-title" className="relative isolate overflow-hidden bg-ink">
      {/* Background photo: mono duotone + coarse halftone + heavy grain */}
      <div className="absolute inset-0 -z-10">
        <DuotoneImage
          photo="roomBwWide"
          alt=""
          halftone="coarse"
          priority
          sizes="100vw"
          className="h-full w-full opacity-70"
        />
        {/* Legibility scrim: dark on the copy side, fades toward the photo */}
        <div
          aria-hidden="true"
          className="absolute inset-0 bg-[linear-gradient(90deg,var(--color-ink)_0%,rgb(20_21_25/0.92)_38%,rgb(20_21_25/0.55)_70%,rgb(20_21_25/0.35)_100%)] max-lg:bg-[linear-gradient(180deg,rgb(20_21_25/0.7)_0%,rgb(20_21_25/0.9)_55%,var(--color-ink)_100%)]"
        />
        <Grain fine={0.25} coarse={0.45} />
      </div>

      <div className="relative mx-auto grid max-w-7xl items-center gap-14 px-4 pt-12 pb-24 sm:px-6 md:pt-16 lg:min-h-[44rem] lg:grid-cols-[1.15fr_0.85fr] lg:gap-8 lg:pt-20 lg:pb-32">
        <div className="relative z-10">
          <p className="eyebrow flex flex-wrap items-center gap-x-3 gap-y-1 text-muted">
            <span>Rehearsal studio</span>
            <span aria-hidden="true">/</span>
            <span>3 rooms</span>
            <span aria-hidden="true">/</span>
            <span>9 AM – 9 PM</span>
          </p>
          <h1 id="hero-title" className="mt-4 text-paper">
            <span className="display block text-display-1">Got a band?</span>
            <span className="display block text-display-1">
              Play it <Highlight className="font-dirt">loud.</Highlight>
            </span>
          </h1>
          <p className="mt-6 max-w-xl text-lg text-paper">
            Three rehearsal rooms. The backline&apos;s ready — all you need to bring is your band.
          </p>
          <p className="mt-3 text-lg text-paper">
            <strong>{rate} per hour, per room.</strong>
          </p>

          <div className="mt-8 flex flex-wrap items-center gap-4">
            <Link to="/book" className="btn btn-primary">
              Book your jam <ArrowRight aria-hidden="true" className="size-5" />
            </Link>
            <Link to="/rates" className="btn btn-ghost">
              See rates
            </Link>
          </div>

          <div className="mt-8 flex items-center gap-2 text-paper" aria-hidden="true">
            <Squiggle className="h-10 w-20 -scale-y-100 rotate-12 text-rust-light" />
            <span className="marker -rotate-3 text-xl">bring your own gear — or rent ours</span>
          </div>
        </div>

        {/* Taped, torn snapshot + price sticker */}
        <div className="relative mx-auto w-full max-w-md lg:max-w-none">
          <div className="relative rotate-[3deg] drop-shadow-[10px_12px_0_rgba(0,0,0,0.55)]">
            <DuotoneImage photo="bandRehearsalStudio" torn={11} tone="natural" halftone={false} className="aspect-[4/3] w-full" />
            <Tape className="-top-3 left-6" rotate={-24} />
            <Tape className="-right-6 bottom-6" rotate={-62} />
          </div>
          <p className="marker absolute -bottom-10 left-2 -rotate-6 text-lg text-paper">turn it up!!!</p>
          <div className="absolute -top-10 right-2 grid size-28 -rotate-12 place-items-center rounded-full border-4 border-rust bg-paper text-ink shadow-[4px_4px_0_0_var(--color-ink)] sm:-right-4 sm:size-32">
            <p className="text-center leading-none">
              <span className="display block text-[2.1rem] sm:text-[2.4rem]">{rate}</span>
              <span className="mt-1 block font-mono text-[0.7rem] font-bold tracking-wider">per hour / room</span>
            </p>
          </div>
        </div>
      </div>

      <div className="absolute inset-x-0 bottom-0">
        <TornEdge className="text-charcoal" underClassName="text-slate" seed={5} height={46} />
      </div>
    </section>
  )
}
