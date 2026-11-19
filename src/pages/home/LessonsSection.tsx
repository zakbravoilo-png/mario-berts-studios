import { Link } from 'react-router'
import { ArrowRight } from 'lucide-react'
import { DuotoneImage, Highlight, NoiseOverlay, Tape, TornEdge } from '../../components/grunge'
import { lessonTypes } from '../../data/services'
import { defaultSettings } from '../../data/settings'
import { formatPHP } from '../../utils/money'
import { formatDuration } from '../../utils/duration'

export function LessonsSection() {
  const s = defaultSettings
  const beginner = s.lessonPrices.beginner
  const rotations = ['-rotate-3', 'rotate-2', '-rotate-1', 'rotate-3', '-rotate-2', 'rotate-1']
  return (
    <section aria-labelledby="lessons-title" className="relative">
      <TornEdge className="text-band" underClassName="text-slate" backClassName="bg-ink" seed={27} height={44} />
      <div className="paper-band on-paper relative">
        <NoiseOverlay grain="coarse" opacity={0.55} className="grain-edges" />
        <div className="relative mx-auto grid max-w-7xl gap-12 px-4 py-16 sm:px-6 lg:grid-cols-[1.2fr_0.8fr] lg:py-20">
          <div>
            <p className="eyebrow text-ink/80">05 — Lessons</p>
            <h2 id="lessons-title" className="display mt-2 text-display-2 text-ink">
              Learn it <Highlight>one-on-one</Highlight>
            </h2>
            <p className="mt-4 max-w-xl text-ink/90">
              One session per booking, held in one of our studio rooms: {formatDuration(s.lessonDurationMinutes.beginner)} for
              beginners, {formatDuration(s.lessonDurationMinutes.intermediate)} for intermediate. Pick your instrument, your
              level and a time — then choose from the instructors who are free.
            </p>

            <ul className="mt-8 flex flex-wrap gap-3" aria-label="Instruments taught">
              {lessonTypes.map((l, i) => (
                <li key={l.id} className={`sticker text-xl ${rotations[i % rotations.length]}`}>
                  {l.label}
                </li>
              ))}
            </ul>

            <dl className="mt-10 grid max-w-lg grid-cols-2 border-2 border-ink">
              <div className="border-r-2 border-ink p-4">
                <dt className="eyebrow text-ink/80">Beginner</dt>
                <dd className="m-0 mt-1 font-mono text-2xl font-bold text-ink">
                  {beginner !== null ? formatPHP(beginner) : 'TBD'}
                  <span className="block text-xs font-normal">per session ({formatDuration(s.lessonDurationMinutes.beginner)})</span>
                </dd>
              </div>
              <div className="p-4">
                <dt className="eyebrow text-ink/80">Intermediate</dt>
                <dd className="m-0 mt-1 font-mono text-2xl font-bold text-ink">
                  {s.lessonPrices.intermediate !== null ? formatPHP(s.lessonPrices.intermediate) : 'TBD'}
                  <span className="block text-xs font-normal">per session ({formatDuration(s.lessonDurationMinutes.intermediate)})</span>
                </dd>
              </div>
            </dl>

            <Link to="/book/lesson" className="btn btn-primary mt-8">
              Request a lesson <ArrowRight aria-hidden="true" className="size-5" />
            </Link>
            <p className="mt-3 text-xs text-ink/80">Instructors shown in this prototype are demo placeholders.</p>
          </div>

          <div className="relative mx-auto w-full max-w-md self-center pb-14">
            <div className="relative rotate-2 drop-shadow-[10px_10px_0_rgba(20,21,25,0.85)]">
              <DuotoneImage photo="gearGuitars" torn={41} className="aspect-[3/2] w-full" sizes="(min-width: 1024px) 40vw, 100vw" />
              <Tape className="-top-3 left-8" rotate={-10} />
            </div>
            <div className="absolute -bottom-2 -left-8 w-[38%] -rotate-6 drop-shadow-[8px_8px_0_rgba(20,21,25,0.85)]">
              <DuotoneImage photo="drumsStripes" torn={52} tone="rust" className="aspect-square w-full" sizes="(min-width: 1024px) 20vw, 50vw" />
              <Tape className="-top-3 right-4 !w-20" rotate={12} />
            </div>
          </div>
        </div>
      </div>
      <TornEdge className="text-band" underClassName="text-slate" backClassName="bg-ink" side="bottom" seed={33} height={44} />
    </section>
  )
}
