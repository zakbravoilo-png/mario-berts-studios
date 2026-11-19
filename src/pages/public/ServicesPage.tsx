import { Link } from 'react-router'
import { ArrowRight, CalendarClock, GraduationCap, RadioTower } from 'lucide-react'
import { PageHeader } from '../../components/ui/PageHeader'
import { useTitle } from '../../components/ui/useTitle'
import { defaultSettings } from '../../data/settings'
import { formatPHP, formatPHPOrTbd } from '../../utils/money'
import { formatDuration } from '../../utils/duration'

export function ServicesPage() {
  useTitle('Services')
  const s = defaultSettings
  const items = [
    {
      icon: CalendarClock,
      title: 'Band rehearsal',
      price: `${formatPHP(s.roomRatePerHour)} / hour, per room`,
      body: 'Three independently bookable rooms, each with a mixer, two guitar amps, a bass amp, a drum kit, two mics and three vocal speakers included. Optional gear rentals are charged once per booking.',
      to: '/services/rehearsal',
      cta: 'Book a room',
      ctaTo: '/book',
    },
    {
      icon: GraduationCap,
      title: 'One-on-one lessons',
      price: `${formatPHPOrTbd(s.lessonPrices.beginner)} beginner · ${formatPHPOrTbd(s.lessonPrices.intermediate)} intermediate`,
      body: `Drums, guitar, bass, keyboard, piano and voice. Beginner sessions are ${formatDuration(s.lessonDurationMinutes.beginner)}, intermediate sessions ${formatDuration(s.lessonDurationMinutes.intermediate)}, held in a studio room with your choice of available instructor.`,
      to: '/services/lessons',
      cta: 'Request a lesson',
      ctaTo: '/book/lesson',
    },
    {
      icon: RadioTower,
      title: 'Live gig streaming',
      price: `${formatPHP(s.streamingRatePerHour)} / hour`,
      body: 'Have your gig streamed. Packages, equipment and platforms are to be confirmed by the studio — every request starts as an inquiry.',
      to: '/services/live-streaming',
      cta: 'Send an inquiry',
      ctaTo: '/book/streaming',
    },
  ]
  return (
    <>
      <PageHeader eyebrow="Services" title="Rooms, lessons, streams.">
        Three services. That&apos;s the whole menu.
      </PageHeader>
      <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6" aria-label="Service list">
        <ul className="grid gap-6 lg:grid-cols-3">
          {items.map((it) => (
            <li key={it.title} className="card flex flex-col p-6">
              <it.icon aria-hidden="true" className="size-8 text-rust-light" />
              <h2 className="display mt-5 text-display-3">{it.title}</h2>
              <p className="mt-2 font-mono text-lg font-bold">{it.price}</p>
              <p className="mt-4 flex-1 text-paper/90">{it.body}</p>
              <div className="mt-6 flex flex-wrap items-center gap-4">
                <Link to={it.ctaTo} className="btn btn-primary">
                  {it.cta} <ArrowRight aria-hidden="true" className="size-5" />
                </Link>
                <Link to={it.to} className="link font-semibold">
                  Details
                </Link>
              </div>
            </li>
          ))}
        </ul>
      </section>
    </>
  )
}
