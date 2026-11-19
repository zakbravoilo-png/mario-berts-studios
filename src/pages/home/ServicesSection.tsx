import { Link } from 'react-router'
import { ArrowRight, CalendarClock, GraduationCap, RadioTower, type LucideIcon } from 'lucide-react'
import { Highlight, NoiseOverlay, TornEdge } from '../../components/grunge'
import { defaultSettings } from '../../data/settings'
import { formatPHP, formatPHPOrTbd } from '../../utils/money'
import { formatDuration } from '../../utils/duration'

interface ServiceCard {
  icon: LucideIcon
  tag: string
  title: string
  price: React.ReactNode
  body: string
  to: string
  cta: string
}

export function ServicesSection() {
  const s = defaultSettings
  const beginner = s.lessonPrices.beginner
  const cards: ServiceCard[] = [
    {
      icon: CalendarClock,
      tag: 'Rooms',
      title: 'Band rehearsal',
      price: (
        <>
          {formatPHP(s.roomRatePerHour)} <span className="text-base">/ hour, per room</span>
        </>
      ),
      body: 'Standard equipment is included. Optional gear rentals are charged once per booking, not per hour.',
      to: '/services/rehearsal',
      cta: 'Rehearsal details',
    },
    {
      icon: GraduationCap,
      tag: 'One-on-one',
      title: 'Music lessons',
      price: (
        <>
          <span className="text-base">from</span> {beginner !== null ? formatPHP(beginner) : 'TBD'} <span className="text-base">/ session</span>
        </>
      ),
      body: `Drums, guitar, bass, keyboard, piano and voice, in a studio room. Beginner: ${formatDuration(s.lessonDurationMinutes.beginner)}, ${formatPHPOrTbd(beginner)}. Intermediate: ${formatDuration(s.lessonDurationMinutes.intermediate)}, ${formatPHPOrTbd(s.lessonPrices.intermediate)}.`,
      to: '/services/lessons',
      cta: 'Lesson details',
    },
    {
      icon: RadioTower,
      tag: 'Inquiry',
      title: 'Live gig streaming',
      price: (
        <>
          {formatPHP(s.streamingRatePerHour)} <span className="text-base">/ hour</span>
        </>
      ),
      body: 'Stream your gig. Packages and technical details are to be confirmed by the studio — send an inquiry.',
      to: '/services/live-streaming',
      cta: 'Streaming details',
    },
  ]

  return (
    <section aria-labelledby="services-title" className="relative">
      <TornEdge className="text-band" underClassName="text-slate" backClassName="bg-charcoal" seed={3} height={44} />
      <div className="paper-band on-paper relative">
        <NoiseOverlay grain="coarse" opacity={0.55} className="grain-edges" />
        <div className="relative mx-auto max-w-7xl px-4 pt-14 pb-20 sm:px-6 lg:pt-16">
          <div className="flex flex-wrap items-end justify-between gap-6">
            <div>
              <p className="eyebrow text-ink/80">01 — Services</p>
              <h2 id="services-title" className="display mt-2 text-display-2 text-ink">
                What we <Highlight>do</Highlight>
              </h2>
            </div>
            <p className="max-w-sm text-base text-ink/85">
              Rehearsal rooms, one-on-one lessons and live gig streaming. That&apos;s the whole menu.
            </p>
          </div>

          <ul className="mt-12 grid gap-6 md:grid-cols-3">
            {cards.map((c, i) => (
              <li
                key={c.title}
                className={`relative flex flex-col bg-ink p-6 text-paper shadow-[8px_8px_0_0_var(--color-slate)] ${
                  i === 1 ? 'md:translate-y-6' : ''
                } ${i === 0 ? 'md:-rotate-[0.6deg]' : i === 2 ? 'md:rotate-[0.6deg]' : ''}`}
              >
                <div className="flex items-center justify-between">
                  <c.icon aria-hidden="true" className="size-8 text-rust-light" />
                  <span className="tape-label">{c.tag}</span>
                </div>
                <h3 className="display mt-6 text-display-3">{c.title}</h3>
                <p className="mt-2 font-mono text-2xl font-bold">{c.price}</p>
                <p className="mt-4 flex-1 text-sm text-paper/85">{c.body}</p>
                <Link to={c.to} className="link mt-6 inline-flex items-center gap-2 font-semibold">
                  {c.cta} <ArrowRight aria-hidden="true" className="size-4" />
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </div>
      <TornEdge className="text-band" underClassName="text-slate" backClassName="bg-charcoal" side="bottom" seed={19} height={44} />
    </section>
  )
}
