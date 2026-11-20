import { Link } from 'react-router'
import { ArrowRight, Clock, DoorOpen, UserRound } from 'lucide-react'
import { PageHeader, SectionTitle } from '../../components/ui/PageHeader'
import { useTitle } from '../../components/ui/useTitle'
import { Callout } from '../../components/ui/Callout'
import { lessonLevels, lessonTypes } from '../../data/services'
import { defaultSettings } from '../../data/settings'
import { formatPHPOrTbd } from '../../utils/money'
import { formatDuration } from '../../utils/duration'

export function LessonsPage() {
  useTitle('One-on-one lessons')
  const s = defaultSettings
  return (
    <>
      <PageHeader eyebrow="Services / Lessons" title="Learn it one-on-one." photo="gearGuitars">
        Drums, guitar, bass, keyboard, piano and voice — at beginner or intermediate level.
      </PageHeader>

      <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6" aria-labelledby="levels-title">
        <SectionTitle eyebrow="Levels and prices" id="levels-title">
          One session per booking
        </SectionTitle>
        <div className="mt-6 overflow-x-auto">
          <table className="w-full min-w-[28rem] border-collapse text-left">
            <caption className="sr-only">Lesson levels, session length and price</caption>
            <thead>
              <tr className="border-b-2 border-paper">
                <th scope="col" className="eyebrow py-3 pr-4 font-normal text-muted">Level</th>
                <th scope="col" className="eyebrow py-3 pr-4 font-normal text-muted">Session length</th>
                <th scope="col" className="eyebrow py-3 text-right font-normal text-muted">Price per session</th>
              </tr>
            </thead>
            <tbody>
              {lessonLevels.map((l) => (
                <tr key={l.id} className="border-b border-slate">
                  <th scope="row" className="py-4 pr-4 text-lg font-semibold">{l.label}</th>
                  <td className="py-4 pr-4">{formatDuration(s.lessonDurationMinutes[l.id])}</td>
                  <td className="py-4 text-right font-mono text-xl font-bold">{formatPHPOrTbd(s.lessonPrices[l.id])}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <p className="mt-3 text-sm text-muted">Same price for every instrument. Pay the full fee on the day, at the studio — no downpayment. You can cancel up to the day before, but not on the lesson day.</p>

        <h3 className="display mt-12 text-2xl">Instruments</h3>
        <ul className="mt-4 flex flex-wrap gap-3" aria-label="Instruments taught">
          {lessonTypes.map((l) => (
            <li key={l.id} className="sticker text-xl">{l.label}</li>
          ))}
        </ul>

        <div className="mt-12 grid gap-6 md:grid-cols-3">
          <div className="card p-5">
            <Clock aria-hidden="true" className="size-6 text-rust-light" />
            <h3 className="mt-3 font-semibold">Pick a time</h3>
            <p className="mt-1 text-sm text-muted">Start times every {s.lessonSlotMinutes} minutes (demo setting), within 9 AM – 9 PM.</p>
          </div>
          <div className="card p-5">
            <UserRound aria-hidden="true" className="size-6 text-rust-light" />
            <h3 className="mt-3 font-semibold">Choose your instructor</h3>
            <p className="mt-1 text-sm text-muted">You&apos;ll only see instructors who teach your instrument and level and are free for the whole session.</p>
          </div>
          <div className="card p-5">
            <DoorOpen aria-hidden="true" className="size-6 text-rust-light" />
            <h3 className="mt-3 font-semibold">In a studio room</h3>
            <p className="mt-1 text-sm text-muted">Lessons use one of the three rehearsal rooms; a free room is assigned for you.</p>
          </div>
        </div>

        <Callout tone="demo" title="Demo instructors" className="mt-10 max-w-2xl">
          The instructors in this prototype are placeholders (&ldquo;Demo Instructor 1&rdquo; and so on). Real names and schedules are to be
          provided by the studio.
        </Callout>

        <Link to="/book/lesson" className="btn btn-primary mt-8">
          Request a lesson <ArrowRight aria-hidden="true" className="size-5" />
        </Link>
      </section>
    </>
  )
}
